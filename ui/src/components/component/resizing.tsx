"use client";
import { Resizable } from "re-resizable";
import { CSSProperties, Suspense } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useDndMonitor, useDraggable } from "@dnd-kit/core";
import { Loader } from "lucide-react";
import { Component } from "./component";
import { useComponent } from "./context";
import { ErrorBoundary } from "react-error-boundary";
export function ResizableComponent({ setResizing }: {
    setResizing: (value: boolean) => void;
}) {
    const { component, size, setSize, position, setPosition, locked } =
        useComponent();
    const { setNodeRef, transform } = useDraggable({
        id: component.id,
    });
    const style: CSSProperties = {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
        transform: CSS.Translate.toString(transform),
    };

    useDndMonitor({
        onDragEnd(event) {
            if (event.active.id === component.id && event.delta) {
                const cord = {
                    x: position.x + event.delta.x,
                    y: position.y + event.delta.y,
                };
                setPosition(cord);
                localStorage.setItem(
                    `${component.viewId}-${component.id}-cord`,
                    JSON.stringify(cord),
                );
            }
        },
    });
    return (
        <div
            id={component.id}
            ref={setNodeRef}
            key={component.id}
            style={style}
            className={`comp`}
        >
            <Resizable
                size={{ height: size.h, width: size.w }}
                enable={{
                    bottom: !locked,
                    bottomLeft: !locked,
                    bottomRight: !locked,
                    left: !locked,
                    right: !locked,
                    top: !locked,
                    topLeft: !locked,
                    topRight: !locked,
                }}
                onResizeStart={() => {
                    setResizing(true);
                }}
                onResizeStop={(e, direction, ref, d) => {
                    setResizing(false);
                    const dim = {
                        w: size.w + d.width,
                        h: size.h + d.height,
                    };
                    localStorage.setItem(
                        `${component.viewId}-${component.id}-dim`,
                        JSON.stringify(dim),
                    );
                    setSize(dim);
                }}
                className="rounded-md border   touch-none"
            >
                <ErrorBoundary
                    fallbackRender={() => (
                        <div className="grid place-items-center w-full h-full">
                            Error loading data
                        </div>
                    )}
                >
                    <Suspense
                        fallback={
                            <Loader className="animate-spin m-auto h-full" />
                        }
                    >
                        <Component />
                    </Suspense>
                </ErrorBoundary>
            </Resizable>
        </div>
    );
}
