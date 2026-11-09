import React from "react";
import { Composition } from "remotion";
import { Cover } from "./Cover";
import { Video } from "./Video";
export const Root: React.FC = () => (
  <>
  <Composition id="OKRCover" component={Cover} durationInFrames={1} fps={30} width={1920} height={1080}/>
  <Composition
    id="OKRSelfReview"
    component={Video}
    durationInFrames={4500}
    fps={30}
    width={1920}
    height={1080}
  />
  </>
);
