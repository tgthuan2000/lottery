import { Button as AntButton, ButtonProps as AntButtonProps, Tooltip } from "antd";
import { ArrowLeftIcon, RotateCwIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { queryClient } from "~/config/query-client";
import { useConfig } from "~/store/config";
import { cn } from "~/util";
import { SEARCH_PARAMS } from "../constants/search-param";
import useSearchParam from "../hooks/use-search-param";

const Button = {
  Slot(props: AntButtonProps) {
    const { children, className, ...rest } = props;

    return (
      <AntButton
        className={cn("w-52 flex items-center justify-center", className)}
        size="large"
        {...rest}
      >
        {children}
      </AntButton>
    );
  },
  Icon(props: Omit<AntButtonProps, "children">) {
    return <AntButton htmlType="button" type="text" {...props} />;
  },
  Back() {
    const navigate = useNavigate();
    const [, , slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);

    const { slot } = useConfig((state) => {
      const slot = state.getSlot(slotParam);

      return {
        slot: {
          value: slot,
        },
      };
    });

    return (
      <Tooltip title="Back">
        <Button.Icon
          icon={<ArrowLeftIcon />}
          className="fixed top-2 left-2"
          onClick={() => navigate(-1)}
          style={{ color: slot.value?.textColor2 }}
        />
      </Tooltip>
    );
  },
  Reload(props: { queryKey: string[] }) {
    const { queryKey } = props;

    const [load, setLoad] = useState(false);

    const handleReload = async () => {
      setLoad(true);

      await queryClient.invalidateQueries({ type: "all", queryKey });

      setLoad(false);
    };

    return (
      <Tooltip title="Reload">
        <Button.Icon icon={<RotateCwIcon />} onClick={handleReload} loading={load} />
      </Tooltip>
    );
  },
};

export default Button;
