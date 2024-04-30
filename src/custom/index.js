import CustomContextPadProvider from './CustomContextPadProvider';
import CustomElementFactory from './CustomElementFactory';
import CustomOrderingProvider from './CustomOrderingProvider';
import CustomPalette from './CustomPalette';
import CustomRenderer from './CustomRenderer';
import CustomRules from './CustomRules';
//import CustomUpdater from './CustomUpdater';

export default {
  __init__: [
    'customRenderer',
    'customPalette',
    'contextPadProvider',
    //'customOrderingProvider',
    'customRules',
    //'customUpdater',
    'elementFactory'
  ],
  customRenderer: [ 'type', CustomRenderer ],
  contextPadProvider: [ 'type', CustomContextPadProvider ],
  //customOrderingProvider: [ 'type', CustomOrderingProvider ],
  customRules: [ 'type', CustomRules ],
  //customUpdater: [ 'type', CustomUpdater ],
  elementFactory: [ 'type', CustomElementFactory ],
  customPalette: [ 'type', CustomPalette ]
};
