import Canvas from "@/components/Canvas";
import TopToolbar from "@/components/TopToolbar";


export default function Home() {
  return (
   <div className="relative w-full h-full" >
    <TopToolbar></TopToolbar>
    <Canvas></Canvas>
   </div>
  );
}
