import { App, Empty } from "antd";
import { ReactNode, useEffect, useState } from "react";
import { useConfig } from "~/store/config";
import { SEARCH_PARAMS } from "../constants/search-param";
import useConfirmPassword from "../hooks/use-confirm-password";
import useSearchParam from "../hooks/use-search-param";
import Button from "./button";

type Props = {
  children: ReactNode;
};

export default function PrivatePage(props: Props) {
  const { children } = props;
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const { message } = App.useApp();
  const [verified, setVerified] = useState(false);
  const confirmPassword = useConfirmPassword();

  const { slot } = useConfig((state) => {
    return {
      slot: {
        verify: state.verifySlotPassword,
      },
    };
  });

  useEffect(() => {
    confirmPassword({
      title: "Private Page",
      onConfirm(value) {
        if (slotParam && value && slot.verify(slotParam, value)) {
          setVerified(true);
          message.success("Successfully");
        } else {
          setVerified(false);
          message.error("Unsuccessfully");
        }
      },
    });

    return () => {
      setVerified(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!slotParam || !verified) {
    return (
      <>
        <Button.Back />
        <div className="h-screen flex justify-center items-center">
          <Empty description="Not Allow!" />
        </div>
      </>
    );
  }

  return children;
}
