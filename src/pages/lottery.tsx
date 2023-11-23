import { Button as AntButton, Descriptions, Modal, Typography } from "antd";
import { ArrowLeftIcon } from "lucide-react";
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import Button from "~/shared/components/button";
import { SEARCH_PARAMS } from "~/shared/constants/search-param";
import useSearchParam from "~/shared/hooks/use-search-param";
import { useConfig } from "~/store/config";

export default function LotteryPage() {
  const navigate = useNavigate();
  const [slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [historyParam] = useSearchParam(SEARCH_PARAMS.HISTORY);
  const [, setPrize] = useSearchParam(SEARCH_PARAMS.PRIZE);

  const { slot, prize, history } = useConfig((state) => {
    const slotValue = state.getSlot(slotParam);

    return {
      slot: {
        value: slotValue,
      },
      prize: {
        value: state.convertToList(slotValue?.prizes),
      },
      history: {
        value: slotValue?.history[historyParam ?? ""],
      },
    };
  });

  return (
    <>
      <Button.Icon
        icon={<ArrowLeftIcon />}
        className="fixed top-2 left-2"
        onClick={() => navigate(-1)}
      />
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
                {Array.from({ length: _prize.slot }).map((_, order) => {
                  const _ticket = history.value?.prizes[_prize._id][order];

                  return (
                    <Fragment key={order}>
                      {_ticket ? (
                        <Typography.Title className="!my-0" level={4}>
                          {_ticket.label}
                        </Typography.Title>
                      ) : (
                        <AntButton
                          htmlType="button"
                          onClick={() => setPrize(_prize._id)}
                          size="large"
                        >
                          TICKET
                        </AntButton>
                      )}
                    </Fragment>
                  );
                })}
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
  const [, , _historyParam] = useSearchParam(SEARCH_PARAMS.HISTORY);
  const [, setPrize, _prize] = useSearchParam(SEARCH_PARAMS.PRIZE);

  const handleRun = () => {};

  const handleClose = () => {
    setPrize(undefined);
  };

  return (
    <Modal
      open={Boolean(_slotParam && _historyParam && _prize)}
      closeIcon={false}
      closable={false}
      centered
      width={1000}
      footer={false}
    >
      <div className="h-[500px] flex items-center flex-col relative justify-center">
        <Typography className="text-[200px] font-normal">{~~(Math.random() * 10000)}</Typography>

        <div className="flex gap-3 absolute bottom-3">
          <AntButton htmlType="button" size="large" onClick={handleClose}>
            CLOSE
          </AntButton>
          <AntButton htmlType="button" size="large" onClick={handleRun}>
            START
          </AntButton>
        </div>
      </div>
    </Modal>
  );
};
