import type { MetaFunction } from "@remix-run/node";
import MuxPlayer from "@mux/mux-video-react";
import MuxTheme from "player.style/yt/react";

const PLAYBACK_ID = "4XN6dqxPTZJPU021TuSGIHPaOuKQkrxHF";

export const meta: MetaFunction = () => {
  return [{ title: "Test Mux player.style" }];
};

export default function Index() {
  return (
    <main className="flex flex-col gap-8 items-center justify-center h-screen container mx-auto">
      <h1 className="text-4xl font-bold text-center">
        Mux Video player.style test (Remix)
      </h1>

      <MuxTheme
        style={{
          width: "100%",
        }}
      >
        <MuxPlayer
          poster={`https://image.mux.com/${PLAYBACK_ID}/thumbnail.jpg`}
          slot="media"
          className="overflow-hidden"
          playbackId={PLAYBACK_ID}
          streamType="on-demand"
          playsInline
          disablePictureInPicture={true}
          disableCookies={true}
          disableTracking={true}
        />
      </MuxTheme>
    </main>
  );
}
