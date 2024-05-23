import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import customModdleExtension from './custom-modeler/custom.json';

import diagramXML from './diagram.bpmn';
import customControlsModule from './BPMNExtensions';
import './app.css';

import lintModule from "bpmn-js-bpmnlint";
import "./linting/bpmn-js-bpmnlint.css";

import { createLintConfig } from "./linting/create-lint-config";
import { noProductsDefined } from "./linting/no-products-defined";

import bpmnlintConfig from "./linting/.bpmnlintrc";

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');
const $hideExecutorButton = document.querySelector('#hide-executor-button');

var uploadBPMN = document.getElementById('js-upload-bpmn');
var downloadBPMN = document.getElementById('js-download-bpmn');
var zoomIn = document.getElementById('js-zoom-in');
var zoomOut = document.getElementById('js-zoom-out');
var center = document.getElementById('js-center');

var modelName = 'diagram';

const modeler = new Modeler({
  container: $modelerContainer,
  moddleExtensions: {
    custom: customModdleExtension
  },
  linting: {
    bpmnlint: bpmnlintConfig,
    /*bpmnlint: createLintConfig({
      rules: {
        "test/no-products-defined": "warn"
      },
      plugins: [
        {
          name: "test",
          rules: {
            "no-products-defined": noProductsDefined
          }
        }
      ]
    }),*/
    active: true
  },
  keyboard: {
    bindTo: document.body
  },
  additionalModules: [
    customControlsModule,
    lintModule
  ]
});


const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

modeler.importXML(diagramXML);

function downloadXML(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


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


var href = new URL(window.location.href);
var src = href.searchParams.get('src');
if (src) {
  loadBPMN(src);
}

function loadBPMN(URL) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      show(xhttp.responseText);
    }
    else {
      console.warn('Failed to get file. ReadyState: ' + xhttp.readyState + ', Status: ' + xhttp.status);
    }
  };
  xhttp.open('GET', URL, true);
  xhttp.send();
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
    modelName = event.target.files[0].name.split('.')[0];
  });
}

if (downloadBPMN) {
  downloadBPMN.addEventListener('click', function () {

    modeler.saveXML({ format: true }).then(function (result) {
      download(result.xml, 'testing.bpmn', 'application/xml');
    }).catch(function (err) {
      console.error('Failed to save BPMN XML', err);
    });
  });
}

modeler.saveXML({ format: true }).then(function (result) {
  download(result.xml, 'testing.bpmn', 'application/xml');
}).catch(function (err) {
  console.error('Failed to save BPMN XML', err);
});


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

let elementsToHide = [];
let savedXML;

$hideExecutorButton.addEventListener('change', function () {
  if ($hideExecutorButton.checked) {
    // Salva il file XML corrente
    modeler.saveXML({ format: true }).then(function (result) {
      savedXML = result.xml;
    }).catch(function (err) {
      console.error('Failed to save BPMN XML', err);
    });

    var allElements = modeler.get('elementRegistry');
    allElements.forEach(function (element) {
      if (
        element.type === 'custom:Executor' ||
        (element.type === 'custom:Connection' &&
          (element.businessObject.sourceRef.$type === 'custom:Executor' ||
            element.businessObject.targetRef.$type === 'custom:Executor'))
      ) {
        elementsToHide.push(element);
      }
    });

    var graphicsFactory = modeler.get('graphicsFactory');
    elementsToHide.forEach(function (element) {
      graphicsFactory.remove(element);
    });
  } else {
    // Ripristina il file XML salvato
    if (savedXML) {
      modeler.importXML(savedXML);
    }
    elementsToHide = [];
    savedXML = null;
  }
});