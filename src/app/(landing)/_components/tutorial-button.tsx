"use client";

import React from "react";
import { MonitorPlay } from "@phosphor-icons/react";
import Vimeo from "@u-wave/react-vimeo";

import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";

export default function TutorialButton({
  tutorialVideoId,
}: {
  tutorialVideoId: string;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          size="lg"
          className="rounded-lg"
          variant="secondary"
          // className="bg-gradient-to-r from-purple-500 to-blue-500"
          type="button"
        >
          <MonitorPlay className="h-5 w-5 mr-2" /> Watch a tutorial
        </Button>
      </DialogTrigger>
      <DialogContent hasCloseButton={false} className="p-2 max-w-6xl">
        <div>
          <Vimeo
            // style={{ width: "564px", maxWidth: "100%" }}
            responsive
            showByline={false}
            showPortrait={false}
            showTitle={false}
            dnt={true}
            video={tutorialVideoId}
            autoplay
            // onReady={(player) => {
            //   console.log("Player is ready:", player);
            // }}
            // onPlay={() => {
            //   console.log("Video is playing");
            // }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
