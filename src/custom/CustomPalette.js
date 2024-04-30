export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const { bpmnFactory, create, elementFactory, translate } = this;

    function createTask() {
      return function (event) {
        const businessObject = bpmnFactory.create("custom:Hexagon");

        const shape = elementFactory.createShape({
          type: "custom:Hexagon",
          businessObject: businessObject
        });

        create.start(event, shape);
      };
    }

    return {
      "create.Hexagon": {
        group: "custom",
        className: "icon-custom-hexagon",
        title: translate("Create Executor"),
        action: {
          dragstart: createTask(),
          click: createTask()
        }
      }
    };
  }
}

CustomPalette.$inject = [
  "bpmnFactory",
  "create",
  "elementFactory",
  "palette",
  "translate"
];
