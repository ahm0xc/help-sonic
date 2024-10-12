import React from "react";
import Siriwave, { IReactSiriwaveProps } from "react-siriwave";

const MemoizedSiriwave = React.memo(Siriwave);

export default function MemoizedSiriWave(props: IReactSiriwaveProps) {
  return <MemoizedSiriwave {...props} />;
}
