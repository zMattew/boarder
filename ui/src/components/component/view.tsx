"use client";
import {
    closestCorners,
    DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
} from "@dnd-kit/core";
import { createSnapModifier } from "@dnd-kit/modifiers";
import { useLayoutEffect, useRef, useState } from "react";
import {
    ReactZoomPanPinchState,
    TransformComponent,
    TransformWrapper,
    useControls,
} from "react-zoom-pan-pinch";
import { useView } from "../../hooks/view-context";
import { Button } from "../shadcn/button";
import { Maximize, Minus, Plus, Save } from "lucide-react";
import { ResizableComponent } from "./resizing";
import { ComponentProvider } from "./context";
import { saveViewState } from "@/lib/view";
import { useProject } from "@/hooks/project-context";
import { toast } from "sonner";

export function ComponentView() {
    const { currentView } = useView();
    const [isDragging, setIsDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const transformRef = useRef(null);
    const meta = {...currentView?.meta as {
        positionX?: number;
        positionY?: number;
        scale?: number;
    }}
    console.log(`Init state`,meta)
    console.log(currentView)
    const setStateLocal = (v: Partial<ReactZoomPanPinchState>) => {
            if (currentView?.id) {
                localStorage.setItem(
                    `${currentView?.id}-view`,
                    JSON.stringify(v),
                );
                currentView.meta = {...currentView.meta as Record<string,unknown>,...v}
            }
        };
    return (
        <TransformWrapper
            ref={transformRef}
            panning={{ disabled: isDragging, excluded: ["comp"] }}
            pinch={{ disabled: isDragging }}
            doubleClick={{ disabled: isDragging, excluded: ["comp"] }}
            wheel={{ disabled: isDragging, excluded: ["comp"] }}
            initialPositionX={meta?.positionX}
            initialPositionY={meta?.positionY}
            initialScale={meta?.scale}
            limitToBounds={false}
            onTransformed={(e)=>{
                setStateLocal(e.state)
            }}
            disablePadding={resizing}
            minScale={0.6}
        >
            <TransformView
                setIsDragging={setIsDragging}
                setResizing={setResizing}
            />
        </TransformWrapper>
    );
}

export function TransformView(
    { setIsDragging, setResizing }: {
        setIsDragging: (v: boolean) => void;
        setResizing: (v: boolean) => void;
    },
) {
    const { setTransform } = useControls();
    const { currentView } = useView();
    const snapToGridModifier = createSnapModifier(20);
    const touchSensor = useSensor(TouchSensor);
    const mouseSensor = useSensor(MouseSensor);
    useLayoutEffect(() => {
        const savedState = localStorage.getItem(`${currentView?.id}-view`);
        if (savedState) {
            const state: ReactZoomPanPinchState = JSON.parse(savedState);
            if (state) {
                setTransform(state.positionX, state.positionY, state.scale, 0);
            }
        }
    }, [currentView?.id,setTransform]);

    return (
        <>
            <ZoomComponentViewControls />
            <TransformComponent
                wrapperStyle={{ width: "100%", height: "calc(100% - 64px)" }}
            >
                <DndContext
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onDragCancel={() => setIsDragging(false)}
                    modifiers={[snapToGridModifier]}
                    collisionDetection={closestCorners}
                    sensors={[mouseSensor, touchSensor]}
                >
                    {currentView?.components.map((component) => (
                        <ComponentProvider
                            component={component}
                            key={component.id}
                        >
                            <ResizableComponent
                                setResizing={setResizing}
                            />
                        </ComponentProvider>
                    ))}
                </DndContext>
            </TransformComponent>
        </>
    );
}

export function ZoomComponentViewControls() {
    const { zoomIn, zoomOut, resetTransform } = useControls();
    const { currentProject } = useProject();
    const { currentView } = useView();
    return (
        <>
            <div className="absolute bottom-2 mx-2 flex flex-col gap-2 w-fit z-[2]">
                <Button
                    variant="outline"
                    onClick={() => zoomIn()}
                    className="hover:cursor-pointer h-6 w-6"
                >
                    <Plus />
                </Button>
                <Button
                    variant="outline"
                    onClick={() => zoomOut()}
                    className="hover:cursor-pointer h-6 w-6"
                >
                    <Minus />
                </Button>
                <div className="flex flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => resetTransform()}
                        className="hover:cursor-pointer h-6 w-6"
                    >
                        <Maximize />
                    </Button>
                    {currentProject?.role == "viewer" ? <></> : (
                        <Button
                            variant="outline"
                            onClick={async () => {
                                try{
                                    await saveViewState(
                                        currentView!.id,
                                        currentView!.meta as Record<
                                            string,
                                            unknown
                                        >,
                                        currentView?.components?.map((c) => ({
                                            id: c.id,
                                            meta: c.meta as Record<string, unknown>,
                                        })) ?? [],
                                    );
                                    toast.success("View saved")
                                }
                                catch(error){
                                    toast.error(`${error}`)
                                }
                            }}
                            className="hover:cursor-pointer h-6 w-6"
                        >
                            <Save />
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
