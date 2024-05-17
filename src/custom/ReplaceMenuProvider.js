import { isAny } from "bpmn-js/lib/features/modeling/util/ModelingUtil";

export default class MyReplaceMenuProvider {
  constructor(popupMenu, bpmnReplace) {
    popupMenu.registerProvider("bpmn-replace", this);
    this.replaceElement = bpmnReplace.replaceElement;
  }

  getPopupMenuEntries(element) {
    const self = this;
    return function (entries) {
      if (isAny(element, ["bpmn:Task"])) {
        entries = {
          ...entries,
          "replace-with-service-task": {
            label: "Batch activity",
            className: "bpmn-icon-service-task",
            action: function () {
              return self.replaceElement(element, {
                type: "bpmn:ServiceTask",
              });
            }
          }
        };
      }
      return entries;
    };
  }
}

MyReplaceMenuProvider.$inject = ["popupMenu", "bpmnReplace"];
