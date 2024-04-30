import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import customModdleExtension from './moddle/custom.json';
import diagramXML from './diagram.bpmn';
import customControlsModule from './custom';
import './app.css';

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');
const $downloadButton = document.querySelector('#download-button');

const modeler = new Modeler({
  container: $modelerContainer,
  moddleExtensions: {
    custom: customModdleExtension
  },
  keyboard: {
    bindTo: document.body
  },
  additionalModules: [
    customControlsModule
  ]
});


const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

modeler.importXML(diagramXML);

document.addEventListener('keydown', function (event) {
  if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyS') {
    return;
  }
  event.preventDefault();

  modeler.saveXML({ format: true }).then(function (result) {
    download(result.xml, 'testing.bpmn', 'application/xml');
  }).catch(function (err) {
    console.error('Failed to save BPMN XML', err);
  });
});

$downloadButton.addEventListener('click', function () {
  modeler.saveXML({ format: true }).then(function (result) {
    download(result.xml, 'testing.bpmn', 'application/xml');
  }).catch(function (err) {
    console.error('Failed to save BPMN XML', err);
  });
});

function download(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(a.href);
}
