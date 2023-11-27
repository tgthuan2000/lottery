import { App, Dropdown, MenuProps } from "antd";
import { DropdownButtonProps } from "antd/lib/dropdown";
import dayjs from "dayjs";
import { XIcon } from "lucide-react";
import { ReactNode, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "~/store/config";
import { SEARCH_PARAMS } from "../constants/search-param";
import Button from "./button";

type Props = DropdownButtonProps & {
  children: ReactNode;
  slotParam: string;
};

export default function DropdownHistory(props: Props) {
  const { children, slotParam, ...rest } = props;
  const navigate = useNavigate();
  const { modal } = App.useApp();

  const { slot, history } = useConfig((state) => {
    const slotValue = state.getSlot(slotParam);

    return {
      slot: {
        createHistory: state.createHistoryGame(slotParam),
      },

      history: {
        value: state.convertToList(slotValue?.history),
        delete: state.deleteSlotHistory(slotParam),
      },
    };
  });

  const lottery = (historyId?: string) => {
    navigate({
      pathname: "/lottery",
      search: `${SEARCH_PARAMS.SLOT}=${slotParam}&${SEARCH_PARAMS.HISTORY}=${
        historyId ?? slot.createHistory()
      }`,
    });
  };

  const items = useMemo<MenuProps["items"]>(() => {
    return history.value.map((_history) => {
      return {
        key: _history._id,
        label: (
          <div className="relative group">
            {_history.name ?? _history._id.slice(0, 4)} -{" "}
            {dayjs(_history._createdAt).format("HH:mm DD/MM/YY")}
            <Button.Icon
              danger
              onClick={(e) => {
                e.stopPropagation();

                modal.confirm({ content: "Are you sure?" }).then(
                  (confirmed) => confirmed && history.delete(_history._id),
                  () => {}
                );
              }}
              className="absolute left-[calc(100%+20px)] opacity-0 group-hover:opacity-100 top-1/2 -translate-y-1/2"
              icon={<XIcon />}
            />
          </div>
        ),
      };
    });
  }, [history, modal]);

  return (
    <Dropdown.Button
      htmlType="button"
      size="large"
      menu={{ items, onClick: (value) => lottery(value.key) }}
      onClick={() => lottery()}
      className="w-full flex [&>button]:grow"
      {...rest}
    >
      {children}
    </Dropdown.Button>
  );
}
