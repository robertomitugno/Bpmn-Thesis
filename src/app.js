import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import customModdleExtension from './moddle/custom.json';

import diagramXML from './diagram.bpmn';
import customControlsModule from './custom';
import './app.css';

import lintModule from "bpmn-js-bpmnlint";
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import bpmnlintConfig from './.bpmnlintrc';

import { createLintConfig } from "./create-lint-config";
import { noGatewayJoinFork } from "./no-gateway-join-fork";

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
    //bpmnlint: bpmnlintConfig
    bpmnlint: createLintConfig({
      rules: {
        "test/no-gateway-join-fork": "error"
      },
      plugins: [
        {
          name: "test",
          rules: {
            "no-gateway-join-fork": noGatewayJoinFork
          }
        }
      ]
    })
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



const customExecutorSymbol = document.createElement('label');
customExecutorSymbol.classList.add('custom-executor-symbol');
customExecutorSymbol.textContent = 'E';
customExecutorSymbol.style.backgroundColor = 'red';

let currentCustomExecutor;

modeler.on('element.create', function (event) {
  console.log("entro");
  if (event.element.type === 'custom:Executor') {
    console.log("entro if");

    currentCustomExecutor = event.element;

    const x = currentCustomExecutor.x;
    const y = currentCustomExecutor.y;

    customExecutorSymbol.style.left = `${x}px`;
    customExecutorSymbol.style.top = `${y}px`;

    $modelerContainer.appendChild(customExecutorSymbol);
  }
});

modeler.on('create.end', function (event) {
  console.log(modeler.get('eventBus'));
  if (event.shape.type === 'custom:Executor') {
    const customExecutorSymbol = document.createElement('div');
    customExecutorSymbol.classList.add('custom-executor-symbol');
    customExecutorSymbol.style.backgroundColor = 'red';
    customExecutorSymbol.style.position = 'absolute';

    const x = event.shape.x;
    const y = event.shape.y;
    const width = event.shape.width;
    const height = event.shape.height;

    // Posiziona il simbolo in alto a sinistra dell'elemento custom:Executor
    customExecutorSymbol.style.left = `${x}px`;
    customExecutorSymbol.style.top = `${y}px`;

    // Aggiungi il simbolo al contenitore della modellazione
    $modelerContainer.appendChild(customExecutorSymbol);
  }
});

modeler.on('connection.changed', function (event) {
  console.log("changed");
});