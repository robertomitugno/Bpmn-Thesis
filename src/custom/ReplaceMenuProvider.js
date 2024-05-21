import { is } from "bpmn-js/lib/util/ModelUtil";

import { isDifferentType } from "./TypeUtil";

import { forEach, filter } from "min-dash";

import * as replaceOptions from "./ReplaceOptions";

/**
 * This module is an element agnostic replace menu provider for the popup menu.
 */
export default function CustomMenuProvider(
  popupMenu,
  modeling,
  moddle,
  bpmnReplace,
  rules,
  translate
) {
  this._popupMenu = popupMenu;
  this._modeling = modeling;
  this._moddle = moddle;
  this._bpmnReplace = bpmnReplace;
  this._rules = rules;
  this._translate = translate;

  this.register();
}

CustomMenuProvider.$inject = [
  "popupMenu",
  "modeling",
  "moddle",
  "bpmnReplace",
  "rules",
  "translate"
];

/**
 * Register replace menu provider in the popup menu
 */
CustomMenuProvider.prototype.register = function () {
  this._popupMenu.registerProvider("bpmn-replace", this);
};

/**
 * Get all entries from replaceOptions for the given element and apply filters
 * on them. Get for example only elements, which are different from the current one.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of menu entry items
 */
CustomMenuProvider.prototype.getEntries = function(element) {
  var businessObject = element.businessObject;
  var rules = this._rules;
  var entries = [];

  if (!rules.allowed("shape.replace", { element: element })) {
    return [];
  }

  var differentType = isDifferentType(element);

  if (is(businessObject, "bpmn:Task") &&
    (element.businessObject.incoming && element.businessObject.incoming.some(el => el.$type === 'custom:Connection') ||
      element.businessObject.outgoing && element.businessObject.outgoing.some(el => el.$type === 'custom:Connection'))) {
    entries = [filter(replaceOptions.TASK, differentType).find(option => option.actionName === 'replace-with-service-task')];
  } else if (is(businessObject, "bpmn:Task")) {
    entries = filter(replaceOptions.TASK, differentType);
  }

  return this._createEntries(element, entries.filter(Boolean)); // Filtra gli undefined
};



/**
 * Creates an array of menu entry objects for a given element and filters the replaceOptions
 * according to a filter function.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} replaceOptions
 *
 * @return {Array<Object>} a list of menu items
 */
CustomMenuProvider.prototype._createEntries = function(element, replaceOptions) {
  var menuEntries = [];
  var self = this;

  forEach(replaceOptions, function(definition) {
    if (!definition) {
      console.warn("Found undefined definition in replaceOptions");
    } else {
      var entry = self._createMenuEntry(definition, element);
      if (entry) {
        menuEntries.push(entry);
      }
    }
  });

  return menuEntries;
};

CustomMenuProvider.prototype._createMenuEntry = function(definition, element, action) {
  var translate = this._translate;
  var replaceElement = this._bpmnReplace.replaceElement;

  if (!definition) {
    console.warn("definition is undefined or null");
    return null;
  }

  var replaceAction = function() {
    return replaceElement(element, definition.target);
  };

  var label = '';
  if (definition.label) {
    label = typeof definition.label === "function" ? definition.label(element) : definition.label;
  } else {
    console.warn("definition.label is undefined");
  }

  action = action || replaceAction;

  var menuEntry = {
    label: translate(label),
    className: definition.className,
    id: definition.actionName,
    action: action
  };

  return menuEntry;
};
