import { getDemoCaseSummaries } from "../../fixtures/demo-cases";
import { SignalSkinApp } from "@/components/signal-skin-app";

export default function HomePage() {
  return <SignalSkinApp demoCases={getDemoCaseSummaries()} />;
}
