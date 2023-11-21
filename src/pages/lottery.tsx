import Button from "~/shared/components/button";
import TicketGame from "~/shared/components/ticket-game";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import Ticket from "~/shared/service/ticket";
import { useConfig } from "~/store/config";

export default function LotteryPage() {
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [selected, random] = Ticket.useRandomSelected();
  console.log("🚀 ~ file: lottery.tsx:11 ~ LotteryPage ~ selected:", selected)

  const { slot, utils } = useConfig((state) => {
    const slotValue = state.getSlot(slotParam);

    return {
      slot: {
        value: slotValue,
      },
      prize: {
        value: state.convertToList(slotValue?.prizes),
      },
      utils: {
        convertToList: state.convertToList,
      },
    };
  });

  return (
    <>
      <TicketGame
        value={utils.convertToList(slot.value?.tickets)}
        getItemKey={(item) => item._id}
        getItemLabel={(item) => item.label}
        selectedNumber={selected}
      />

      <Button.Slot onClick={() => random(0, 10, 5)}>Random</Button.Slot>
    </>
  );
}
