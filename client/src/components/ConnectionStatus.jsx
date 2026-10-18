import { useEffect, useState } from "react";
import { FiActivity, FiRefreshCw } from "react-icons/fi";
import { getApiHealth } from "../api/health.js";

export default function ConnectionStatus() {
  const [state, setState] = useState({ status: "checking", detail: "Checking API connection…" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getApiHealth()
      .then((health) => {
        if (active) setState({
          status: "connected",
          detail: `API connected · database ${health.database}`
        });
      })
      .catch(() => {
        if (active) setState({
          status: "offline",
          detail: "API unreachable · start the server and check its logs"
        });
      });
    return () => { active = false; };
  }, [attempt]);

  const icon = state.status === "checking" ? <FiRefreshCw className="animate-spin" /> : <FiActivity />;

  return (
    <div className={`connection-status connection-status--${state.status}`} role="status" aria-live="polite">
      <span className="connection-status__icon" aria-hidden="true">{icon}</span>
      <span className="connection-status__copy">
        <strong>{state.status === "connected" ? "System status" : state.status === "offline" ? "Connection issue" : "Connecting"}</strong>
        <small>{state.detail}</small>
      </span>
      {state.status === "offline" && <button className="text-button" onClick={() => setAttempt((value) => value + 1)} type="button">Retry</button>}
    </div>
  );
}
