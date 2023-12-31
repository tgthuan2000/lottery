import { App, Input, InputRef } from "antd";
import { ReactNode, useCallback, useRef } from "react";

export default function useConfirmPassword() {
  const { modal } = App.useApp();
  const inputRef = useRef<InputRef>(null);

  const onConfirm = useCallback(
    ({
      title,
      onConfirm,
    }: {
      title: ReactNode;
      onConfirm: (inputValue: string | undefined) => void;
    }) => {
      const modalInstance = modal.confirm({
        title,
        content: <Input.Password ref={inputRef} placeholder="Enter your slot password" />,
      });

      modalInstance.then(
        (confirmed) => {
          const inputValue = inputRef.current?.input?.value;

          if (confirmed) {
            onConfirm(inputValue);
          }
        },
        () => {}
      );

      return modalInstance;
    },
    [modal]
  );

  return onConfirm;
}
