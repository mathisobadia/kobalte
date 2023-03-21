import { Portal } from "solid-js/web";

import { Dialog, I18nProvider, Toast, toaster, MultiSelect } from "../src";
import { For } from "solid-js";

export default function App() {
  const showToast = () => {
    toaster.show(id => (
      <Toast.Root id={id} class="ToastRoot">
        <Toast.Title class="ToastTitle">Title - {id}</Toast.Title>
        <Toast.Description class="ToastDescription">Description</Toast.Description>
        <button onClick={() => toaster.dismiss(id)}>Accept</button>
        <Toast.CloseButton onClick={() => console.log("foo")}>X</Toast.CloseButton>
        <div class="ToastProgressTrack">
          <div class="ToastProgressFill" />
        </div>
      </Toast.Root>
    ));
  };

  return (
    <I18nProvider>
      <button onClick={showToast}>Show toast</button>
      <Dialog.Root>
        <Dialog.Trigger class="dialog__trigger">Open</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay class="dialog__overlay" />
          <div class="dialog__positioner">
            <Dialog.Content class="dialog__content">
              <div class="dialog__header">
                <Dialog.Title class="dialog__title">About Kobalte</Dialog.Title>
                <Dialog.CloseButton class="dialog__close-button">X</Dialog.CloseButton>
              </div>
              <Dialog.Description class="dialog__description">
                Kobalte is a UI toolkit for building accessible web apps and design systems with
                SolidJS. It provides a set of low-level UI components and primitives which can be
                the foundation for your design system implementation.
              </Dialog.Description>
              <button onClick={showToast}>Show toast</button>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
      <Portal>
        <Toast.Region>
          <Toast.List class="ToastViewport" />
        </Toast.Region>
      </Portal>
      <MultiSelect.Root
        options={["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]}
        placeholder="Select some fruits…"
        renderValue={selection => (
          <>
            <For each={selection.items()}>
              {item => (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => selection.remove(item)}
                >
                  {item.rawValue}
                </button>
              )}
            </For>
            <button onPointerDown={e => e.stopPropagation()} onClick={selection.clear}>
              X
            </button>
          </>
        )}
        renderItem={item => (
          <MultiSelect.Item item={item()}>
            <MultiSelect.ItemLabel>{item().rawValue}</MultiSelect.ItemLabel>
            <MultiSelect.ItemIndicator>X</MultiSelect.ItemIndicator>
          </MultiSelect.Item>
        )}
      >
        <MultiSelect.Trigger aria-label="Fruits">
          <MultiSelect.Value />
          <MultiSelect.Icon>V</MultiSelect.Icon>
        </MultiSelect.Trigger>
        <MultiSelect.Portal>
          <MultiSelect.Content>
            <MultiSelect.Listbox />
          </MultiSelect.Content>
        </MultiSelect.Portal>
      </MultiSelect.Root>
    </I18nProvider>
  );
}
