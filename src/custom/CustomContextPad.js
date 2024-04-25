/**
 * 
 *  per personalizzare il menu contestuale che appare quando si fa clic con il pulsante destro 
 *  del mouse su un elemento del diagramma di flusso.
 * 
 **/




/*export default class CustomContextPad {
    constructor(config, contextPad, create, elementFactory, injector, translate) {
      this.create = create;
      this.elementFactory = elementFactory;
      this.translate = translate;
  
      if (config.autoPlace !== false) {
        this.autoPlace = injector.get('autoPlace', false);
      }
  
      contextPad.registerProvider(this);
    }
  
    getContextPadEntries(element) {
      const {
        autoPlace,
        create,
        elementFactory,
        translate
      } = this;
  
      function appendServiceTask(event, element) {
        if (autoPlace) {
          const shape = elementFactory.createShape({ type: 'bpmn:Hexagon' });
    
          autoPlace.append(element, shape);
        } else {
          appendServiceTaskStart(event, element);
        }
      }
  
      function appendServiceTaskStart(event) {
        const shape = elementFactory.createShape({ type: 'bpmn:Hexagon' });
    
        create.start(event, shape, element);
      }
  
      return {
        'append.Hexagon': {
          group: 'model',
          className: 'bpmn-icon-Hexagon',
          title: translate('Append Hexagon'),
          action: {
            click: appendServiceTask,
            dragstart: appendServiceTaskStart
          }
        }
      };
    }
  }
  
  CustomContextPad.$inject = [
    'config',
    'contextPad',
    'create',
    'elementFactory',
    'injector',
    'translate'
  ];*/