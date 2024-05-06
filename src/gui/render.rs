#![allow(non_snake_case)]
//#![allow(unused_imports)]

use anyhow::{Context, Result};
use serde_json::json;
use std::{borrow::BorrowMut, cell::RefCell};
use std::rc::Rc;
use std::sync::{Arc, Mutex};

pub use vello::util::RenderSurface;
pub use vello::{
    kurbo::{Affine, BezPath, Ellipse, PathEl, Point, Rect, Vec2},
    util::RenderContext,
    Renderer, RendererOptions, Scene, SceneBuilder, SceneFragment, AaConfig,
};

use winit::dpi::{LogicalSize, PhysicalSize};
use winit::{
    event::{Event, WindowEvent},
    event_loop::EventLoop,
    event_loop::{ControlFlow, EventLoopBuilder, EventLoopProxy},
    window::Window
};

use crate::context::{Context2D, Page};
use vello::{peniko::*, AaSupport};
use vello::peniko::{Brush, Color};

pub struct EngineRenderer {
    pub surface: RenderSurface,
    pub rcx: RenderContext,
    pub renderers: Vec<Option<Renderer>>,

    pub scene: Scene,
    pub window: Window,
    pub page: Arc<Mutex<Page>>,
}

// GPU 관련 3가지만 처리 : 서피스 생성, 리사이징, 드로잉
impl EngineRenderer {
    pub fn new(window: Window, page: Arc<Mutex<Page>>) -> Self {
        let mut rc: RenderContext = RenderContext::new().unwrap();
        let mut renderers: Vec<Option<Renderer>> = vec![];

        let dpr = window.scale_factor();
        let draw_size = window.inner_size();
        let size = window.inner_size().to_logical::<f32>(dpr);
        let (width, height) = (draw_size.width, draw_size.height);

        let surface_future = rc.create_surface(&window, width, height);
        let surface = pollster::block_on(surface_future).expect("Error creating surface");

        renderers.resize_with(rc.devices.len(), || None);
        let id = surface.dev_id;
        renderers[id].get_or_insert_with(|| {
            Renderer::new(
                &rc.devices[id].device,
                RendererOptions {
                    surface_format: Some(surface.format),
                    //timestamp_period: rc.devices[id].queue.get_timestamp_period(),
                    use_cpu: false,
                    antialiasing_support: vello::AaSupport::all()
                },
            )
            .expect("Could create renderer")
        });

        // 굳이 씬을 여기서 데리고 다닐 필요가 있나?
        Self {
            surface,
            rcx: rc,
            renderers,
            scene: Scene::new(),
            window,
            page,
        }
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.rcx.resize_surface(&mut self.surface, width, height);
        self.window.request_redraw()
    }

    pub fn draw(&mut self, matrix: Affine) {
        let width = self.surface.config.width;
        let height = self.surface.config.height;
        let device_handle = &self.rcx.devices[self.surface.dev_id];

        let mut builder = SceneBuilder::for_scene(&mut self.scene);
        let mut page = self.page.lock().unwrap();
        {
            let count = page.frags.len();
            if count == 0 {
                return;
            }
        }
        let dpr = self.window.scale_factor();
        let matrix = matrix * Affine::scale_non_uniform(dpr, dpr);
        
        for item in &mut page.frags {
            builder.append(item, Some(matrix));
        }
        page.frags.clear();

        // background color
        let render_params = vello::RenderParams {
            base_color: Color::rgb8(255, 255, 255),
            width,
            height,
            antialiasing_method:  AaConfig::Msaa16,
        };

        let surface_texture = self
            .surface
            .surface
            .get_current_texture()
            .expect("failed to get surface texture");
        {
            vello::block_on_wgpu(
                &device_handle.device,
                self.renderers[self.surface.dev_id]
                    .as_mut()
                    .unwrap()
                    .render_to_surface_async(
                        &device_handle.device,
                        &device_handle.queue,
                        &self.scene,
                        &surface_texture,
                        &render_params,
                    ),
            )
            .expect("failed to render to surface");
        }
        surface_texture.present();
        device_handle.device.poll(wgpu::Maintain::Poll);

    }
}
