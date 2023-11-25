import { useMutation, useQuery } from "@tanstack/react-query";
import { App, Empty, Typography } from "antd";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import { ArrowLeftIcon, ImportIcon, Loader2Icon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "~/config/db";
import Button from "~/shared/components/button";
import { useConfig } from "~/store/config";

export default function ImportPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const { slot } = useConfig((state) => {
    return {
      slot: {
        import: state.importSlot,
      },
    };
  });

  const { data, isLoading } = useQuery({
    queryKey: ["npp/import/slots"],
    queryFn: async () => {
      return await db.slot.findMany({
        select: {
          id: true,
          createdAt: true,
          label: true,
        },
      });
    },
  });

  const { mutate } = useMutation({
    async mutationFn(id: string) {
      try {
        const data = await db.slot.findFirst({
          where: {
            id,
          },
          select: {
            value: true,
          },
        });

        if (!data) return;

        const slotParsed = JSON.parse(data.value) as ISlot;

        slot.import(slotParsed);
      } catch (error) {
        console.log("🚀 ~ file: import.tsx:53 ~ mutationFn ~ error:", error);
      }
    },
    onSuccess() {
      message.success("Import successfully!");
    },
    onError() {
      message.error("Import unsuccessfully!");
    },
  });

  const handleImport = (id: string) => {
    mutate(id);
  };

  return (
    <>
      <Button.Icon
        icon={<ArrowLeftIcon />}
        className="fixed top-2 left-2"
        onClick={() => navigate(-1)}
      />

      <div className="min-h-screen flex flex-col items-center justify-center">
        {isLoading ? (
          <Typography className="items-center flex">
            <Loader2Icon className="animate-spin mr-2" />
            Loading...
          </Typography>
        ) : isEmpty(data) ? (
          <Empty description="Empty Slot!" />
        ) : (
          <div className="flex flex-col gap-3">
            {data?.map((slot) => (
              <div
                key={slot.id}
                className="flex group: items-start justify-between gap-5 flex-wrap p-3 rounded-md border border-solid border-gray-100"
              >
                <div className="flex flex-col gap-1">
                  <Typography.Title level={5} className="!my-0">
                    {slot.label}
                  </Typography.Title>

                  <Typography.Text>
                    {dayjs(slot.createdAt).format("HH:mm DD/MM/YYYY")}
                  </Typography.Text>
                </div>

                <Button.Icon
                  onClick={() => handleImport(slot.id)}
                  icon={<ImportIcon className="h-5 w-5" />}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
