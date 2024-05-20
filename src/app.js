import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import customModdleExtension from './moddle/custom.json';

import diagramXML from './diagram.bpmn';
import customControlsModule from './custom';
import './app.css';

import lintModule from "bpmn-js-bpmnlint";
import "./linting/bpmn-js-bpmnlint.css";

import { createLintConfig } from "./linting/create-lint-config";
import { noProductsDefined } from "./linting/no-products-defined";

import bpmnlintConfig from "./linting/.bpmnlintrc";

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');
const $downloadButton = document.querySelector('#download-button');
const $hideExecutorButton = document.querySelector('#hide-executor-button');


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


let elementsToHide = [];
let savedXML;

$hideExecutorButton.addEventListener('change', function () {
  console.log(modeler.get('eventBus'));
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


modeler.on('connection.changed', function (event) {
  console.log("changed");
});