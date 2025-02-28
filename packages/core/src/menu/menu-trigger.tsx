/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/5c1920e50d4b2b80c826ca91aff55c97350bf9f9/packages/@react-aria/menu/src/useMenuTrigger.ts
 */

import {
  callHandler,
  createPolymorphicComponent,
  mergeDefaultProps,
  mergeRefs,
} from "@kobalte/utils";
import { createEffect, JSX, onCleanup, splitProps } from "solid-js";

import * as Button from "../button";
import { useMenuContext } from "./menu-context";
import { useMenuRootContext } from "./menu-root-context";

export interface MenuTriggerOptions extends Button.ButtonRootOptions {}

/**
 * The button that toggles the menu.
 */
export const MenuTrigger = createPolymorphicComponent<"button", MenuTriggerOptions>(props => {
  const rootContext = useMenuRootContext();
  const context = useMenuContext();

  props = mergeDefaultProps(
    {
      id: rootContext.generateId("trigger"),
    },
    props
  );

  const [local, others] = splitProps(props, [
    "ref",
    "id",
    "isDisabled",
    "onPointerDown",
    "onClick",
    "onKeyDown",
  ]);

  const onPointerDown: JSX.EventHandlerUnion<any, PointerEvent> = e => {
    callHandler(e, local.onPointerDown);

    e.currentTarget.dataset.pointerType = e.pointerType;

    // For consistency with native, open the select on mouse down, but touch up.
    if (!local.isDisabled && e.pointerType !== "touch") {
      context.toggle(true);
    }
  };

  const onClick: JSX.EventHandlerUnion<any, MouseEvent> = e => {
    callHandler(e, local.onClick);

    if (!local.isDisabled && e.currentTarget.dataset.pointerType === "touch") {
      context.toggle(true);
    }
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = e => {
    callHandler(e, local.onKeyDown);

    if (local.isDisabled) {
      return;
    }

    // For consistency with native, open the menu on key down.
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.stopPropagation();
        e.preventDefault();
        context.toggle("first");
        break;
      case "ArrowUp":
        e.stopPropagation();
        e.preventDefault();
        context.toggle("last");
        break;
    }
  };

  createEffect(() => onCleanup(context.registerTriggerId(local.id!)));

  return (
    <Button.Root
      ref={mergeRefs(context.setTriggerRef, local.ref)}
      id={local.id}
      isDisabled={local.isDisabled}
      aria-haspopup="true"
      aria-expanded={context.isOpen()}
      aria-controls={context.isOpen() ? context.contentId() : undefined}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...context.dataset()}
      {...others}
    />
  );
});
