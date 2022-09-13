import React from "react";
import ReactPlayer from "react-player";
import { useScreen } from "../../../lib/hooks/useScreen";
import { Dialog, DialogProps } from "../utilities/dialog/dialog";

export function VideoDialog({ videoUrl = "", ...props }: DialogProps & { videoUrl: string }) {
  const screenSm = useScreen("sm");
  return (
    <Dialog
      {...props}
      mobileSizeMode={!screenSm}
      slideFromBottom={"none"}
      width={screenSm ? "700px" : "300px"}
    >
      <div>
        {screenSm ? (
          <ReactPlayer
            url={videoUrl}
            width="700px"
            height="400px"
            controls
            config={{
              youtube: {
                playerVars: { showinfo: 1 },
              },
              file: {
                attributes: {
                  controlsList: "nodownload",
                },
              },
            }}
          />
        ) : (
          <ReactPlayer
            url={videoUrl}
            width="300px"
            height="200px"
            controls
            config={{
              youtube: {
                playerVars: { showinfo: 1 },
              },
              file: {
                attributes: {
                  controlsList: "nodownload",
                },
              },
            }}
          />
        )}
      </div>
    </Dialog>
  );
}
