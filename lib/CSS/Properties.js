'use strict';

import azimuth_export_definition from './properties/azimuth.js'
import background_export_definition from './properties/background.js'
import backgroundAttachment_export_definition from './properties/backgroundAttachment.js'
import backgroundColor_export_definition from './properties/backgroundColor.js'
import backgroundImage_export_definition from './properties/backgroundImage.js'
import backgroundPosition_export_definition from './properties/backgroundPosition.js'
import backgroundRepeat_export_definition from './properties/backgroundRepeat.js'
import border_export_definition from './properties/border.js'
import borderBottom_export_definition from './properties/borderBottom.js'
import borderBottomColor_export_definition from './properties/borderBottomColor.js'
import borderBottomStyle_export_definition from './properties/borderBottomStyle.js'
import borderBottomWidth_export_definition from './properties/borderBottomWidth.js'
import borderCollapse_export_definition from './properties/borderCollapse.js'
import borderColor_export_definition from './properties/borderColor.js'
import borderLeft_export_definition from './properties/borderLeft.js'
import borderLeftColor_export_definition from './properties/borderLeftColor.js'
import borderLeftStyle_export_definition from './properties/borderLeftStyle.js'
import borderLeftWidth_export_definition from './properties/borderLeftWidth.js'
import borderRight_export_definition from './properties/borderRight.js'
import borderRightColor_export_definition from './properties/borderRightColor.js'
import borderRightStyle_export_definition from './properties/borderRightStyle.js'
import borderRightWidth_export_definition from './properties/borderRightWidth.js'
import borderSpacing_export_definition from './properties/borderSpacing.js'
import borderStyle_export_definition from './properties/borderStyle.js'
import borderTop_export_definition from './properties/borderTop.js'
import borderTopColor_export_definition from './properties/borderTopColor.js'
import borderTopStyle_export_definition from './properties/borderTopStyle.js'
import borderTopWidth_export_definition from './properties/borderTopWidth.js'
import borderWidth_export_definition from './properties/borderWidth.js'
import bottom_export_definition from './properties/bottom.js'
import clear_export_definition from './properties/clear.js'
import clip_export_definition from './properties/clip.js'
import color_export_definition from './properties/color.js'
import cssFloat_export_definition from './properties/cssFloat.js'
import flex_export_definition from './properties/flex.js'
import flexBasis_export_definition from './properties/flexBasis.js'
import flexGrow_export_definition from './properties/flexGrow.js'
import flexShrink_export_definition from './properties/flexShrink.js'
import float_export_definition from './properties/float.js'
import floodColor_export_definition from './properties/floodColor.js'
import font_export_definition from './properties/font.js'
import fontFamily_export_definition from './properties/fontFamily.js'
import fontSize_export_definition from './properties/fontSize.js'
import fontStyle_export_definition from './properties/fontStyle.js'
import fontVariant_export_definition from './properties/fontVariant.js'
import fontWeight_export_definition from './properties/fontWeight.js'
import height_export_definition from './properties/height.js'
import left_export_definition from './properties/left.js'
import lightingColor_export_definition from './properties/lightingColor.js'
import lineHeight_export_definition from './properties/lineHeight.js'
import margin_export_definition from './properties/margin.js'
import marginBottom_export_definition from './properties/marginBottom.js'
import marginLeft_export_definition from './properties/marginLeft.js'
import marginRight_export_definition from './properties/marginRight.js'
import marginTop_export_definition from './properties/marginTop.js'
import opacity_export_definition from './properties/opacity.js'
import outlineColor_export_definition from './properties/outlineColor.js'
import padding_export_definition from './properties/padding.js'
import paddingBottom_export_definition from './properties/paddingBottom.js'
import paddingLeft_export_definition from './properties/paddingLeft.js'
import paddingRight_export_definition from './properties/paddingRight.js'
import paddingTop_export_definition from './properties/paddingTop.js'
import right_export_definition from './properties/right.js'
import stopColor_export_definition from './properties/stopColor.js'
import textLineThroughColor_export_definition from './properties/textLineThroughColor.js'
import textOverlineColor_export_definition from './properties/textOverlineColor.js'
import textUnderlineColor_export_definition from './properties/textUnderlineColor.js'
import top_export_definition from './properties/top.js'
import webkitBorderAfterColor_export_definition from './properties/webkitBorderAfterColor.js'
import webkitBorderBeforeColor_export_definition from './properties/webkitBorderBeforeColor.js'
import webkitBorderEndColor_export_definition from './properties/webkitBorderEndColor.js'
import webkitBorderStartColor_export_definition from './properties/webkitBorderStartColor.js'
import webkitColumnRuleColor_export_definition from './properties/webkitColumnRuleColor.js'
import webkitMatchNearestMailBlockquoteColor_export_definition from './properties/webkitMatchNearestMailBlockquoteColor.js'
import webkitTapHighlightColor_export_definition from './properties/webkitTapHighlightColor.js'
import webkitTextEmphasisColor_export_definition from './properties/webkitTextEmphasisColor.js'
import webkitTextFillColor_export_definition from './properties/webkitTextFillColor.js'
import webkitTextStrokeColor_export_definition from './properties/webkitTextStrokeColor.js'
import width_export_definition from './properties/width.js'


const setProperty = function (prototype) {
  Object.defineProperties(prototype, {
    azimuth: azimuth_export_definition,
    backgroundColor: backgroundColor_export_definition,
    "background-color": backgroundColor_export_definition,
    backgroundImage: backgroundImage_export_definition,
    "background-image": backgroundImage_export_definition,
    backgroundRepeat: backgroundRepeat_export_definition,
    "background-repeat": backgroundRepeat_export_definition,
    backgroundAttachment: backgroundAttachment_export_definition,
    "background-attachment": backgroundAttachment_export_definition,
    backgroundPosition: backgroundPosition_export_definition,
    "background-position": backgroundPosition_export_definition,
    background: background_export_definition,
    borderWidth: borderWidth_export_definition,
    "border-width": borderWidth_export_definition,
    borderStyle: borderStyle_export_definition,
    "border-style": borderStyle_export_definition,
    borderColor: borderColor_export_definition,
    "border-color": borderColor_export_definition,
    border: border_export_definition,
    borderBottomWidth: borderBottomWidth_export_definition,
    "border-bottom-width": borderBottomWidth_export_definition,
    borderBottomStyle: borderBottomStyle_export_definition,
    "border-bottom-style": borderBottomStyle_export_definition,
    borderBottomColor: borderBottomColor_export_definition,
    "border-bottom-color": borderBottomColor_export_definition,
    borderBottom: borderBottom_export_definition,
    "border-bottom": borderBottom_export_definition,
    borderCollapse: borderCollapse_export_definition,
    "border-collapse": borderCollapse_export_definition,
    borderLeftWidth: borderLeftWidth_export_definition,
    "border-left-width": borderLeftWidth_export_definition,
    borderLeftStyle: borderLeftStyle_export_definition,
    "border-left-style": borderLeftStyle_export_definition,
    borderLeftColor: borderLeftColor_export_definition,
    "border-left-color": borderLeftColor_export_definition,
    borderLeft: borderLeft_export_definition,
    "border-left": borderLeft_export_definition,
    borderRightWidth: borderRightWidth_export_definition,
    "border-right-width": borderRightWidth_export_definition,
    borderRightStyle: borderRightStyle_export_definition,
    "border-right-style": borderRightStyle_export_definition,
    borderRightColor: borderRightColor_export_definition,
    "border-right-color": borderRightColor_export_definition,
    borderRight: borderRight_export_definition,
    "border-right": borderRight_export_definition,
    borderSpacing: borderSpacing_export_definition,
    "border-spacing": borderSpacing_export_definition,
    borderTopWidth: borderTopWidth_export_definition,
    "border-top-width": borderTopWidth_export_definition,
    borderTopStyle: borderTopStyle_export_definition,
    "border-top-style": borderTopStyle_export_definition,
    borderTopColor: borderTopColor_export_definition,
    "border-top-color": borderTopColor_export_definition,
    borderTop: borderTop_export_definition,
    "border-top": borderTop_export_definition,
    bottom: bottom_export_definition,
    clear: clear_export_definition,
    clip: clip_export_definition,
    color: color_export_definition,
    cssFloat: cssFloat_export_definition,
    "css-float": cssFloat_export_definition,
    flexGrow: flexGrow_export_definition,
    "flex-grow": flexGrow_export_definition,
    flexShrink: flexShrink_export_definition,
    "flex-shrink": flexShrink_export_definition,
    flexBasis: flexBasis_export_definition,
    "flex-basis": flexBasis_export_definition,
    flex: flex_export_definition,
    float: float_export_definition,
    floodColor: floodColor_export_definition,
    "flood-color": floodColor_export_definition,
    fontFamily: fontFamily_export_definition,
    "font-family": fontFamily_export_definition,
    fontSize: fontSize_export_definition,
    "font-size": fontSize_export_definition,
    fontStyle: fontStyle_export_definition,
    "font-style": fontStyle_export_definition,
    fontVariant: fontVariant_export_definition,
    "font-variant": fontVariant_export_definition,
    fontWeight: fontWeight_export_definition,
    "font-weight": fontWeight_export_definition,
    lineHeight: lineHeight_export_definition,
    "line-height": lineHeight_export_definition,
    font: font_export_definition,
    height: height_export_definition,
    left: left_export_definition,
    lightingColor: lightingColor_export_definition,
    "lighting-color": lightingColor_export_definition,
    margin: margin_export_definition,
    marginBottom: marginBottom_export_definition,
    "margin-bottom": marginBottom_export_definition,
    marginLeft: marginLeft_export_definition,
    "margin-left": marginLeft_export_definition,
    marginRight: marginRight_export_definition,
    "margin-right": marginRight_export_definition,
    marginTop: marginTop_export_definition,
    "margin-top": marginTop_export_definition,
    opacity: opacity_export_definition,
    outlineColor: outlineColor_export_definition,
    "outline-color": outlineColor_export_definition,
    padding: padding_export_definition,
    paddingBottom: paddingBottom_export_definition,
    "padding-bottom": paddingBottom_export_definition,
    paddingLeft: paddingLeft_export_definition,
    "padding-left": paddingLeft_export_definition,
    paddingRight: paddingRight_export_definition,
    "padding-right": paddingRight_export_definition,
    paddingTop: paddingTop_export_definition,
    "padding-top": paddingTop_export_definition,
    right: right_export_definition,
    stopColor: stopColor_export_definition,
    "stop-color": stopColor_export_definition,
    textLineThroughColor: textLineThroughColor_export_definition,
    "text-line-through-color": textLineThroughColor_export_definition,
    textOverlineColor: textOverlineColor_export_definition,
    "text-overline-color": textOverlineColor_export_definition,
    textUnderlineColor: textUnderlineColor_export_definition,
    "text-underline-color": textUnderlineColor_export_definition,
    top: top_export_definition,
    webkitBorderAfterColor: webkitBorderAfterColor_export_definition,
    "webkit-border-after-color": webkitBorderAfterColor_export_definition,
    webkitBorderBeforeColor: webkitBorderBeforeColor_export_definition,
    "webkit-border-before-color": webkitBorderBeforeColor_export_definition,
    webkitBorderEndColor: webkitBorderEndColor_export_definition,
    "webkit-border-end-color": webkitBorderEndColor_export_definition,
    webkitBorderStartColor: webkitBorderStartColor_export_definition,
    "webkit-border-start-color": webkitBorderStartColor_export_definition,
    webkitColumnRuleColor: webkitColumnRuleColor_export_definition,
    "webkit-column-rule-color": webkitColumnRuleColor_export_definition,
    webkitMatchNearestMailBlockquoteColor: webkitMatchNearestMailBlockquoteColor_export_definition,
    "webkit-match-nearest-mail-blockquote-color": webkitMatchNearestMailBlockquoteColor_export_definition,
    webkitTapHighlightColor: webkitTapHighlightColor_export_definition,
    "webkit-tap-highlight-color": webkitTapHighlightColor_export_definition,
    webkitTextEmphasisColor: webkitTextEmphasisColor_export_definition,
    "webkit-text-emphasis-color": webkitTextEmphasisColor_export_definition,
    webkitTextFillColor: webkitTextFillColor_export_definition,
    "webkit-text-fill-color": webkitTextFillColor_export_definition,
    webkitTextStrokeColor: webkitTextStrokeColor_export_definition,
    "webkit-text-stroke-color": webkitTextStrokeColor_export_definition,
    width: width_export_definition
  });
};


export default setProperty;