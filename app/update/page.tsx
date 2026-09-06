import { Suspense } from "react";
import UpdateStatus from "../components/UpdateStatus";

export default function UpdatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateStatus />
    </Suspense>
  );
}
