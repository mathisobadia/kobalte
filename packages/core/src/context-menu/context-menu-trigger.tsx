/*!
 * Portions of this file are based on code from radix-ui-primitives.
 * MIT Licensed, Copyright (c) 2022 WorkOS.
 *
 * Credits to the Radix UI team:
 * https://github.com/radix-ui/primitives/blob/81b25f4b40c54f72aeb106ca0e64e1e09655153e/packages/react/context-menu/src/ContextMenu.tsx
 */

import {
  callHandler,
  createPolymorphicComponent,
  mergeDefaultProps,
  mergeRefs,
} from "@kobalte/utils";
import { JSX, onCleanup, splitProps } from "solid-js";
import { Dynamic, isServer } from "solid-js/web";

import { useMenuContext } from "../menu/menu-context";
import { useMenuRootContext } from "../menu/menu-root-context";
import { useContextMenuContext } from "./context-menu-context";

export interface ContextMenuTriggerOptions {
  /** Whether the context menu trigger is disabled. */
  isDisabled?: boolean;

  /** The HTML styles attribute (object form only). */
  style?: JSX.CSSProperties;
}

export const ContextMenuTrigger = createPolymorphicComponent<"div", ContextMenuTriggerOptions>(
  props => {
    const rootContext = useMenuRootContext();
    const menuContext = useMenuContext();
    const context = useContextMenuContext();

    props = mergeDefaultProps(
      {
        as: "div",
        id: rootContext.generateId("trigger"),
      },
      props
    );

    const [local, others] = splitProps(props, [
      "as",
      "ref",
      "style",
      "isDisabled",
      "onContextMenu",
      "onPointerDown",
      "onPointerMove",
      "onPointerCancel",
      "onPointerUp",
    ]);

    let longPressTimoutId = 0;

    const clearLongPressTimeout = () => {
      if (isServer) {
        return;
      }

      window.clearTimeout(longPressTimoutId);
    };

    onCleanup(() => {
      clearLongPressTimeout();
    });

    const onContextMenu: JSX.EventHandlerUnion<any, MouseEvent> = e => {
      // If trigger is disabled, enable the native Context Menu.
      if (local.isDisabled) {
        callHandler(e, local.onContextMenu);
        return;
      }

      // Clearing the long press here because some platforms already support
      // long press to trigger a `contextmenu` event.
      clearLongPressTimeout();

      e.preventDefault();

      context.setAnchorRect({ x: e.clientX, y: e.clientY });

      if (menuContext.isOpen()) {
        // If the menu is already open, focus the menu itself.
        menuContext.focusContent();
      } else {
        menuContext.open(true);
      }
    };

    const isTouchOrPen = (e: PointerEvent) => e.pointerType === "touch" || e.pointerType === "pen";

    const onPointerDown: JSX.EventHandlerUnion<any, PointerEvent> = e => {
      callHandler(e, local.onPointerDown);

      if (!local.isDisabled && isTouchOrPen(e)) {
        // Clear the long press here in case there's multiple touch points.
        clearLongPressTimeout();
        longPressTimoutId = window.setTimeout(() => menuContext.open(false), 700);
      }
    };

    const onPointerMove: JSX.EventHandlerUnion<any, PointerEvent> = e => {
      callHandler(e, local.onPointerMove);

      if (!local.isDisabled && isTouchOrPen(e)) {
        clearLongPressTimeout();
      }
    };

    const onPointerCancel: JSX.EventHandlerUnion<any, PointerEvent> = e => {
      callHandler(e, local.onPointerCancel);

      if (!local.isDisabled && isTouchOrPen(e)) {
        clearLongPressTimeout();
      }
    };

    const onPointerUp: JSX.EventHandlerUnion<any, PointerEvent> = e => {
      callHandler(e, local.onPointerUp);

      if (!local.isDisabled && isTouchOrPen(e)) {
        clearLongPressTimeout();
      }
    };

    return (
      <Dynamic
        component={local.as}
        ref={mergeRefs(menuContext.setTriggerRef, local.ref)}
        style={{
          // prevent iOS context menu from appearing
          "-webkit-touch-callout": "none",
          ...local.style,
        }}
        data-disabled={local.isDisabled ? "" : undefined}
        onContextMenu={onContextMenu}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerCancel={onPointerCancel}
        onPointerUp={onPointerUp}
        {...menuContext.dataset()}
        {...others}
      />
    );
  }
);
