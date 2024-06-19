import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import customModdleExtension from './custom-modeler/custom.json';

import diagramXML from './diagram.bpmn';
import bpmnExtension from './BPMNExtensions';
import './app.css';

import lintModule from "bpmn-js-bpmnlint";
import "./linting/bpmn-js-bpmnlint.css";

import bpmnlintConfig from "./linting/.bpmnlintrc";

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');
const $hideExecutorButton = document.querySelector('#hide-executor-button');
const $hideWarningButton = document.querySelector('#hide-warning-button');


var uploadBPMN = document.getElementById('js-upload-bpmn');
var downloadBPMN = document.getElementById('js-download-bpmn');
var zoomIn = document.getElementById('js-zoom-in');
var zoomOut = document.getElementById('js-zoom-out');
var center = document.getElementById('js-center');

const modeler = new Modeler({
  container: $modelerContainer,
  moddleExtensions: {
    custom: customModdleExtension
  },
  linting: {
    bpmnlint: bpmnlintConfig,
    active: true
  },
  additionalModules: [
    bpmnExtension,
    lintModule
  ]
});


const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

modeler.importXML(diagramXML);


if (zoomIn) {
  zoomIn.addEventListener('click', function () {
    modeler.get('zoomScroll').stepZoom(1);
    return false;
  });
}

if (zoomOut) {
  zoomOut.addEventListener('click', function () {
    modeler.get('zoomScroll').stepZoom(-1);
    return false;
  });
}

if (center) {
  center.addEventListener('click', function () {
    modeler.get('canvas').zoom('fit-viewport', 'auto');
    return false;
  });
}


function show(content) {
  modeler.importXML(content);
}



if (uploadBPMN) {
  uploadBPMN.value = '';
  uploadBPMN.addEventListener('change', function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      show(reader.result);
    };
    reader.onerror = function (err) {
      console.log(err, err.loaded, err.loaded === 0, file);
    };

    reader.readAsText(event.target.files[0]);
  });
}

if (downloadBPMN) {
  downloadBPMN.addEventListener('click', function () {
    modeler.saveXML({ format: true }).then(function (result) {
      download(result.xml, 'diagram.bpmn', 'application/xml');
    }).catch(function (err) {
      console.error('Failed to save BPMN XML', err);
    });
  });
}

function download(content, fileName, contentType) {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();

  URL.revokeObjectURL(a.href);

}


/*
* HIDE EXECUTORS
*/

function toggleExecutorsVisibility(visible) {
  const elementRegistry = modeler.get('elementRegistry');
  elementRegistry.filter(function (element) {
    return element.type === 'custom:Executor' || element.type === 'custom:Connection';
  }).forEach(function (element) {
    const gfx = elementRegistry.getGraphics(element);
    gfx.style.display = visible ? 'block' : 'none';
  });
}

$hideExecutorButton.addEventListener('change', function () {
  if ($hideExecutorButton.checked) {
    toggleExecutorsVisibility(false);
  } else {
    toggleExecutorsVisibility(true);
  }
});



/*
* HIDE WARNING
*/
$hideWarningButton.addEventListener('change', function () {
  if ($hideWarningButton.checked) {
    modeler.get('linting').toggle(false);
  } else {
    modeler.get('linting').toggle(true);
  }
});

