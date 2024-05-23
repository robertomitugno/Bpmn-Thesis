import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import { assign } from "min-dash";
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from "tiny-svg";
import {
  getRoundRectPath,
  getFillColor,
  getStrokeColor,
  getSemantic,
  getLabelColor
} from "bpmn-js/lib/draw/BpmnRenderUtil";
import { is } from "bpmn-js/lib/util/ModelUtil";
import { isAny } from "bpmn-js/lib/features/modeling/util/ModelingUtil";

const HIGH_PRIORITY = 1500,
  TASK_BORDER_RADIUS = 6,
  DEFAULT_FILL_OPACITY = 0.95;

export default class CustomRenderer extends BaseRenderer {
  constructor(config, eventBus, bpmnRenderer, textRenderer, styles) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;

    this.computeStyle = styles.computeStyle;
    this.textRenderer = textRenderer;

    this.defaultFillColor = config && config.defaultFillColor;
    this.defaultStrokeColor = config && config.defaultStrokeColor;
    this.defaultLabelColor = config && config.defaultLabelColor;
  }

  canRender(element) {
    return isAny(element, ["custom:Executor", "custom:Connection", "custom:Batch"]) && !element.labelTarget;
  }

  drawShape(parentNode, element, handler) {
    var rect;

    if (is(element, "custom:Executor")) {
      var attrs = {
        fill: getFillColor(element, this.defaultFillColor),
        stroke: getStrokeColor(element, this.defaultStrokeColor),
        fillOpacity: DEFAULT_FILL_OPACITY
      };

      rect = drawHexagon(parentNode, 120, 60, TASK_BORDER_RADIUS, attrs);

      this.renderEmbeddedLabel(
        parentNode,
        element,
        "center-middle",
        getLabelColor(element, this.defaultLabelColor, this.defaultStrokeColor)
      );

      return rect;
    } else if (is(element, "custom:Batch")) {
      element.type = "bpmn:ServiceTask";
      element.width = 100;
      element.height = 80;
      let shape = this.bpmnRenderer.drawShape(parentNode, element, handler);
      element.type = "custom:Batch";
      return shape;
    }
    else {
      return this.bpmnRenderer.drawShape(parentNode, element, handler);
    }
  }


  drawConnection(parentNode, element) {
    const waypoints = element.waypoints;
    const pathData = createPath(waypoints);

    const connectionElement = svgCreate('path');
    svgAttr(connectionElement, {
      d: pathData,
      stroke: getStrokeColor(element, this.defaultStrokeColor),
      fill: 'none',
      'stroke-dasharray': '5, 5'
    });

    svgAppend(parentNode, connectionElement);

    return connectionElement;
  }


  getShapePath(shape) {
    if (is(shape, "custom:Executor")) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }
    return this.bpmnRenderer.getShapePath(shape);
  }

  renderEmbeddedLabel(parentGfx, element, align) {
    var semantic = getSemantic(element);

    return this.renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getLabelColor(
          element,
          this.defaultLabelColor,
          this.defaultStrokeColor
        )
      }
    });
  }

  renderLabel(parentGfx, label, options) {
    options = assign(
      {
        size: {
          width: 100
        }
      },
      options
    );

    var text = this.textRenderer.createText(label || "", options);

    svgClasses(text).add("djs-label");

    svgAppend(parentGfx, text);

    return text;
  }

  _renderer(type) {
    if (type === 'custom:Connection') {
      return this.drawConnection;
    }
    return super._renderer(type);
  }
}

CustomRenderer.$inject = [
  "config.bpmnRenderer",
  "eventBus",
  "bpmnRenderer",
  "textRenderer",
  "styles"
];

// helpers //////////

function drawHexagon(parentNode, width, height) {
  const polygon = svgCreate("polygon");

  const x = width / 2;
  const y = height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;

  const points = [
    x, y - radiusY,
    x + radiusX, y - radiusY / 2,
    x + radiusX, y + radiusY / 2,
    x, y + radiusY,
    x - radiusX, y + radiusY / 2,
    x - radiusX, y - radiusY / 2
  ].join(" ");

  svgAttr(polygon, {
    points: points,
    stroke: "#000",
    strokeWidth: 2,
    fill: "none"
  });

  svgAppend(parentNode, polygon);

  return polygon;
}

function createPath(waypoints) {

  let pathData = 'M ' + waypoints[0].x + ' ' + waypoints[0].y;
  for (let i = 1; i < waypoints.length; i++) {
    pathData += ' L ' + waypoints[i].x + ' ' + waypoints[i].y;
  }

  return pathData;
}