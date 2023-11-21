import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { cn } from "~/util";

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
};

export default Button;
