import { Button as AntButton, Descriptions, Modal, Typography } from "antd";
import { ArrowLeftIcon } from "lucide-react";
import { Fragment, memo, useCallback, useEffect, useState } from "react";
import AnimatedNumbers from "react-animated-numbers";
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
              <div className="flex gap-5 flex-wrap justify-center items-center">
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
                          onClick={() =>
                            setPrize((searchParam) => {
                              searchParam.set(SEARCH_PARAMS.ORDER, order.toString());

                              return _prize._id;
                            })
                          }
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
  const [, , slotParam] = useSearchParam(SEARCH_PARAMS.SLOT);
  const [, , historyParam] = useSearchParam(SEARCH_PARAMS.HISTORY);
  const [, setPrize, prizeParam] = useSearchParam(SEARCH_PARAMS.PRIZE);
  const [, , orderParam] = useSearchParam(SEARCH_PARAMS.ORDER);

  const { slot, history, ticket } = useConfig((state) => {
    const slot = state.getSlot(slotParam);

    return {
      slot: {
        value: slot,
      },
      history: {
        set: state.setHistory(slotParam, historyParam, prizeParam, Number(orderParam)),
      },
      ticket: {
        random: state.randomTicket(slotParam, prizeParam, historyParam),
      },
    };
  });

  // const defaultValue = useMemo(
  //   () => Ticket.getNumber("0", slot.value?.maxLength, "0"),
  //   [slot.value?.maxLength]
  // );

  const randomValue = useCallback(() => {
    const length = slot.value?.maxLength ?? 1;
    const min = Math.pow(10, length) - 1;
    const max = Math.pow(10, length - 1);
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomValue;
  }, [slot.value?.maxLength]);

  const [state, setState] = useState<"pending" | "started" | "stopped" | "canClose">("pending");
  const [value, setValue] = useState<number>(0);

  const resetValue = () => {
    setValue(0);
  };

  const handleRun = () => {
    setState("started");
  };

  useEffect(() => {
    let interval: number | null = null;

    if (state === "started") {
      interval = setInterval(() => setValue(randomValue()), (slot.value?.maxLength ?? 1) * 150);
    }

    return () => {
      interval && clearInterval(interval);
    };
  }, [randomValue, slot.value?.maxLength, state]);

  const handleStop = () => {
    setState("stopped");

    const randomTicket = ticket.random();

    if (!randomTicket) return;

    setValue(Number(randomTicket.value));
    history.set(randomTicket);

    setTimeout(() => {
      setState("canClose");
    }, 5000);
  };

  const handleClose = () => {
    resetValue();
    setState("pending");

    setPrize(undefined);
  };

  return (
    <Modal
      open={Boolean(slotParam && historyParam && prizeParam)}
      closeIcon={false}
      closable={false}
      centered
      width={1000}
      footer={false}
      destroyOnClose
    >
      <div className="h-[500px] flex items-center flex-col relative justify-center">
        <NumberAnimate value={value} />
        <div className="flex flex-col gap-3 absolute bottom-3">
          {state === "pending" && (
            <>
              <AntButton
                className="min-w-[200px]"
                htmlType="button"
                type="primary"
                size="large"
                onClick={handleRun}
              >
                START
              </AntButton>
              <AntButton
                className="min-w-[200px]"
                htmlType="button"
                size="large"
                onClick={handleClose}
              >
                CLOSE
              </AntButton>
            </>
          )}
          {state === "started" && (
            <AntButton
              type="primary"
              className="min-w-[200px]"
              htmlType="button"
              size="large"
              onClick={handleStop}
            >
              STOP
            </AntButton>
          )}

          {state === "canClose" && (
            <AntButton
              className="min-w-[200px]"
              htmlType="button"
              size="large"
              onClick={handleClose}
            >
              CLOSE
            </AntButton>
          )}
        </div>
      </div>
    </Modal>
  );
};

const NumberAnimate = memo((props: { value: number }) => {
  const { value } = props;

  return (
    <AnimatedNumbers
      transitions={(index) => ({
        type: "spring",
        duration: index + 2,
        bounce: 0.3,
      })}
      animateToNumber={value}
      fontStyle={{
        fontSize: 200,
        fontWeight: 400,
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
});
