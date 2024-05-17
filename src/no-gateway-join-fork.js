import { is } from "bpmnlint-utils";
/**
 * A rule that checks, whether a gateway forks and joins
 * at the same time.
 */
export const noGatewayJoinFork = function () {
  function check(node, reporter) {
    if (!is(node, "custom:Executor")) {
      return;
    }

    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];
    console.log("reporter", reporter);
    if (incoming.length < 3 && outgoing.length < 3) {
      console.log("reporter", reporter);

      reporter.report(node.id, "Gateway forks and joins");
    }
  }

  return {
    check
  };
};
