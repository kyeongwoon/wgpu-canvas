#![allow(clippy::single_match)]
#![allow(non_snake_case)]
#![allow(unused_imports)]

use neon::prelude::*;
use std::num::NonZeroUsize;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::{Map, Value};
use std::borrow::BorrowMut;
use std::cell::RefCell;
use std::collections::HashMap;
use std::time::Duration;
use std::time::Instant;
use std::{process::ExitCode, thread::sleep};
use std::{
    sync::{Arc, RwLock},
    thread,
};


// temp
use vello::kurbo::Affine;
use vello::kurbo::{
    Affine as Matrix, BezPath as Path, Circle, Ellipse, Line, PathEl, Point, Rect,
    RoundedRect as RRect, RoundedRectRadii as Radii, Shape, Size, Vec2,
};
use vello::peniko::{Brush, Color};
// temp

use winit::dpi::LogicalSize;
use winit::{
    event::{
        ElementState, Event, KeyEvent, MouseButton, MouseScrollDelta, StartCause, WindowEvent,
    },
    event_loop::{ActiveEventLoop, ControlFlow, EventLoop, EventLoopBuilder, EventLoopProxy},
    keyboard::{Key, ModifiersState},
    platform::pump_events::{EventLoopExtPumpEvents, PumpStatus},
    window::{CursorGrabMode, Window, WindowId, WindowAttributes},
};
use winit::application::ApplicationHandler;
use winit::platform::macos::{OptionAsAlt, WindowAttributesExtMacOS, WindowExtMacOS};

use crate::context::{BoxedContext2D, Context2D};
use crate::utils::*;

pub mod render;
use render::EngineRenderer;

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct WindowSpec {
    pub id: String,
    pub left: Option<f32>,
    pub top: Option<f32>,
    title: String,
    visible: bool,
    fullscreen: bool,
    background: String,
    page: u32,
    width: f32,
    height: f32,
    cursor_hidden: bool,
}

#[derive(Debug, Clone, Copy)]
pub enum CanvasEvent {
    Open,
    Close,
    Quit,
    Timer,
}

pub struct Application {
    pub event_loop: EventLoop<CanvasEvent>,
    pub proxy: EventLoopProxy<CanvasEvent>,
    pub windows: HashMap<WindowId, EngineRenderer>,
}

thread_local!(
    // the event loop can only be run from the main thread
    static EVENT_LOOP: RefCell<EventLoop<CanvasEvent>> = RefCell::new(
        EventLoop::<CanvasEvent>::with_user_event()
            .build()
            .unwrap(),
    );
    static PROXY: RefCell<EventLoopProxy<CanvasEvent>> =
        RefCell::new(EVENT_LOOP.with(|event_loop| event_loop.borrow().create_proxy()));

    static WINDOWS: RefCell<HashMap<WindowId, EngineRenderer>> = RefCell::new(HashMap::new())
);

fn add_event(event: CanvasEvent) {
    PROXY.with(|cell| cell.borrow().send_event(event).ok());
}


pub fn inner_pump() -> (PumpStatus, Vec<Event<CanvasEvent>>) {
    let timeout = Some(Duration::ZERO);
    let mut ev: Vec<Event<CanvasEvent>> = Vec::new();
    let status = EVENT_LOOP.with(|event_loop| {
        event_loop
            .borrow_mut()
            .pump_events(timeout, |event, _elwt| {
                match event {
                    Event::WindowEvent {
                        event: ref win_event,
                        window_id: _,
                    } => match win_event {
                        _ => {
                            ev.push(event.clone());
                        }
                    },
                    Event::UserEvent(event) => {
                        match event {
                            CanvasEvent::Close => {
                                add_event(CanvasEvent::Close)
                            }
                            CanvasEvent::Quit => {
                                add_event(CanvasEvent::Quit)
                            }
                            CanvasEvent::Timer => {}
                            _ => (),
                        }
                        println!("user event: {event:?}");
                    }
                    _ => {
                        //
                    }
                }
            })
    });
    (status, ev)
}

// JS API

pub fn pump(mut cx: FunctionContext) -> JsResult<JsArray> {
    let (_status, evs) = inner_pump();
    let arr: Handle<JsArray> = cx.empty_array();
    let mut i = 0;
    for event in evs {
        let obj: Handle<JsObject> = cx.empty_object();
        match event {
            Event::WindowEvent {
                event: ref win_event,
                window_id,
            } => match win_event {
                WindowEvent::CloseRequested => {
                    let obj: Handle<JsObject> = cx.empty_object();
                    WINDOWS.with(|cell| cell.borrow_mut().clear());
                    let v: Handle<JsString> = cx.string("exit");
                    obj.set(&mut cx, "type", v)?;

                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;

                    arr.set(&mut cx, i, obj)?;
                }
                WindowEvent::Resized(new_size) => {
                    let v: Handle<JsString> = cx.string("resize");

                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);

                    let w : Handle<JsNumber> = cx.number((new_size.width as f64 / 2.0) as f64);
                    let h : Handle<JsNumber> = cx.number((new_size.height as f64 / 2.0) as f64);

                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    obj.set(&mut cx, "width", w)?;
                    obj.set(&mut cx, "height", h)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;

                    WINDOWS.with(|cell| {
                        cell.try_borrow_mut()
                            .unwrap()
                            .get_mut(&window_id)
                            .unwrap()
                            .resize(new_size.width, new_size.height);
                    });
                }
                WindowEvent::RedrawRequested => {
                    let _matrix = Affine::IDENTITY;
                    let v: Handle<JsString> = cx.string("redraw");
                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;
                }
                WindowEvent::MouseInput { state, button, .. } => {
                    let mouse_event = match state {
                        ElementState::Pressed => "mousedown",
                        ElementState::Released => "mouseup",
                    }
                    .to_string();
                    let v = cx.string(mouse_event);
                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;
                }
                WindowEvent::CursorEntered { .. } => {
                    let v = cx.string("focused");
                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;
                }
                WindowEvent::CursorLeft { .. } => {
                    let v = cx.string("blur");
                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;
                }
                WindowEvent::CursorMoved { position, .. } => {
                    let v = cx.string("mousemove");
                    let x = cx.number(position.x);
                    let y = cx.number(position.y);
                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    obj.set(&mut cx, "x", x)?;
                    obj.set(&mut cx, "y", y)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;
                }

                WindowEvent::MouseWheel { delta, .. } => {
                    let v = cx.string("wheel");
                    let id: u64 = window_id.into();
                    let id: Handle<JsNumber> = cx.number(id as f64);
                    obj.set(&mut cx, "windowId", id)?;
                    obj.set(&mut cx, "type", v)?;
                    arr.set(&mut cx, i, obj)?;
                    i = i + 1;
                }
                WindowEvent::KeyboardInput {
                    event:
                        KeyEvent {
                            logical_key: key,
                            state: ElementState::Pressed,
                            ..
                        },
                    ..
                } => match key.as_ref() {
                    _ => (),
                },
                _ => (),
            },
            _ => (),
        }
    }
    Ok(arr)
}

pub fn set_rate(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    Ok(cx.undefined())
}

pub fn draw(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let js_id = cx.argument::<JsNumber>(0)?;
    let id: f64 = js_id.value(&mut cx);
    let matrix = Affine::IDENTITY;
    let window_id = WindowId::from(id as u64);

    WINDOWS.with(|cell| {
        cell.try_borrow_mut()
            .unwrap()
            .get_mut(&window_id)
            .unwrap()
            .draw(matrix);
    });

    Ok(cx.undefined())
}

pub fn open(mut cx: FunctionContext) -> JsResult<JsNumber> {
    //add_event(CanvasEvent::Open);
    let win_config = string_arg(&mut cx, 0, "Window configuration")?;
    //println!("win config {}", win_config);
    let context = cx.argument::<BoxedContext2D>(1)?;
    let spec = serde_json::from_str::<WindowSpec>(&win_config).expect("Invalid window state");


    let mut window_attributes = Window::default_attributes()
    .with_title(spec.title)
    .with_resizable(true)
    .with_inner_size(LogicalSize::new(spec.width, spec.height));

    let mut id = unsafe { WindowId::dummy() };
    /* 
    EVENT_LOOP.with(|event_loop| {
        let window = WindowBuilder::new()
            .with_inner_size(LogicalSize::new(spec.width, spec.height))
            .with_resizable(true)
            .with_title(spec.title)
            .build(&event_loop.borrow_mut())
            .unwrap();
        id = window.id();
        let renderer = EngineRenderer::new(window, context.borrow().get_page());

        WINDOWS.with(|cell| cell.borrow_mut().insert(id, renderer));
    });
    */
    EVENT_LOOP.with(|event_loop| {
        let window = event_loop.borrow_mut().create_window(window_attributes).unwrap();
        id = window.id();
        let a: Arc<Window> = Arc::new(window);
        let mut renderer = EngineRenderer::new(&a, context.borrow().get_page());


        WINDOWS.with(|cell| cell.borrow_mut().insert(id, renderer));

    });

    let raw_id = &id as *const WindowId as *const u64;
    let v = unsafe { *raw_id };

    Ok(cx.number(v as f64))
}

pub fn close(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    Ok(cx.undefined())
}

pub fn quit(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    WINDOWS.with(|cell| cell.borrow_mut().clear());
    Ok(cx.undefined())
}
