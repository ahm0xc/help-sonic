import React from "react";
import { Spinner } from "@phosphor-icons/react/dist/ssr";

export default function Loading() {
  return (
    <div className="h-screen grid place-content-center">
      <Spinner size={25} className="animate-spin" />
    </div>
  );
}
