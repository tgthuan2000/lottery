import { useMutation, useQuery } from "@tanstack/react-query";
import { App, Empty, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import groq from "groq";
import { isEmpty } from "lodash";
import { ImportIcon, Loader2Icon } from "lucide-react";
import { db } from "~/config/db";
import Button from "~/shared/components/button";
import { GET_SLOTS } from "~/shared/constants/query-key";
import { useConfig } from "~/store/config";

type SlotType = { _id: string; _updatedAt: string; name: string };

export default function ImportPage() {
  const { data, isLoading } = useQuery({
    queryKey: GET_SLOTS,
    queryFn: async () => {
      return await db.fetch<Array<SlotType>>(groq`
        *[_type == "slot"] {
          _id,
          _updatedAt,
          name
        }
      `);
    },
  });

  return (
    <>
      <Button.Back />

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
            <Button.Reload queryKey={GET_SLOTS} />

            {data?.map((slot) => (
              <Item key={slot._id} data={slot} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const Item = (props: { data: SlotType }) => {
  const { data } = props;

  const { message } = App.useApp();

  const { slot } = useConfig((state) => {
    return {
      slot: {
        import: state.importSlot,
      },
    };
  });

  const { mutate, isPending } = useMutation({
    async mutationFn(id: string) {
      try {
        const data = await db.fetch<{ value: string }>(
          groq`
          *[_type == "slot" && _id == $_id][0] {
            value
          }
          `,
          { _id: id }
        );

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
    <div className="flex group items-start justify-between gap-5 flex-wrap p-3 rounded-md border border-solid border-gray-100">
      <div className="flex flex-col gap-1">
        <Typography.Title level={5} className="!my-0">
          {data.name}
        </Typography.Title>

        <Typography.Text>{dayjs(data._updatedAt).format("HH:mm - DD/MM/YYYY")}</Typography.Text>
      </div>

      <Tooltip title="Import">
        <Button.Icon
          loading={isPending}
          onClick={() => handleImport(data._id)}
          icon={<ImportIcon className="h-5 w-5" />}
        />
      </Tooltip>
    </div>
  );
};
