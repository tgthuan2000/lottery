import { Button, Descriptions, Modal, Typography } from "antd";
import { Fragment } from "react";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import { useConfig } from "~/store/config";

export default function LotteryPage() {
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [, setTicket] = useSearchParam(SEARCH_PARAMS.TICKET);

  const { slot, prize, utils } = useConfig((state) => {
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
      <div className="flex flex-col gap-5 h-screen overflow-hidden justify-center items-center">
        <Typography.Title level={1}>{slot.value?.name}</Typography.Title>
        <Descriptions bordered layout="horizontal" className="min-w-[500px]">
          {prize.value.map((_prize) => (
            <Descriptions.Item
              key={_prize._id}
              span={10}
              label={
                <div className="flex flex-col items-start gap-1">
                  <Typography.Title level={5} className="!mb-0 truncate min-w-[100px] !font-light">
                    {_prize.name}
                  </Typography.Title>
                  <Typography.Title className="!my-0" level={4}>
                    {_prize.value}
                  </Typography.Title>
                </div>
              }
            >
              <div className="flex gap-5 justify-center items-center">
                {utils.convertToList(_prize.winningTickets).map((_ticket) => (
                  <Fragment key={_ticket._id}>
                    {_ticket.ticket ? (
                      <Typography.Title className="!my-0" level={4}>
                        {_ticket.ticket.label}
                      </Typography.Title>
                    ) : (
                      <Button
                        key={_ticket._id}
                        htmlType="button"
                        onClick={() => {
                          setTicket((searchParam) => {
                            searchParam.set(SEARCH_PARAMS.PRIZE, _prize._id);

                            return _ticket._id;
                          });
                        }}
                        size="large"
                      >
                        TICKET
                      </Button>
                    )}
                  </Fragment>
                ))}
              </div>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </div>

      <LotteryModal />
    </>
  );
}

const LotteryModal = () => {
  const [, , _slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [, setTicket, _ticket] = useSearchParam(SEARCH_PARAMS.TICKET);
  const [, , _prize] = useSearchParam(SEARCH_PARAMS.PRIZE);

  const handleRun = () => {};

  const handleClose = () => {
    setTicket((searchParam) => {
      searchParam.delete(SEARCH_PARAMS.PRIZE);

      return undefined;
    });
  };

  return (
    <Modal
      open={Boolean(_slotParam && _ticket && _prize)}
      closeIcon={false}
      closable={false}
      centered
      width={1000}
      footer={false}
    >
      <div className="h-[500px] flex items-center flex-col relative justify-center">
        <Typography className="text-[200px] font-normal">{~~(Math.random() * 10000)}</Typography>

        <div className="flex gap-3 absolute bottom-3">
          <Button htmlType="button" size="large" onClick={handleClose}>
            CLOSE
          </Button>
          <Button htmlType="button" size="large" onClick={handleRun}>
            START GAME
          </Button>
        </div>
      </div>
    </Modal>
  );
};
