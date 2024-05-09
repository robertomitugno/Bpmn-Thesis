import CustomContextPadProvider from './CustomContextPadProvider';
import CustomElementFactory from './CustomElementFactory';
import CustomOrderingProvider from './CustomOrderingProvider';
import CustomPalette from './CustomPalette';
import CustomRenderer from './CustomRenderer';
import CustomRules from './CustomRules';
//import CustomUpdater from './CustomUpdater';

export default {
  __init__: [
    'contextPadProvider',
    'customRenderer',
    'customPalette',
    //'customOrderingProvider',
    'customRules',
    //'customUpdater',
    'elementFactory'
  ],
  contextPadProvider: [ 'type', CustomContextPadProvider ],
  customRenderer: [ 'type', CustomRenderer ],
  //customOrderingProvider: [ 'type', CustomOrderingProvider ],
  customRules: [ 'type', CustomRules ],
  //customUpdater: [ 'type', CustomUpdater ],
  elementFactory: [ 'type', CustomElementFactory ],
  customPalette: [ 'type', CustomPalette ]
};
