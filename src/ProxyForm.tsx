import React, { FC } from "react";
import {
  Form,
  Select,
  Radio,
  FormInstance,
  FormItemProps,
  FormProps,
} from "antd";

import type { FormListProps } from "antd/lib/form/FormList";

// const { RangePicker, TimePicker } = DatePicker;

enum ComponentTypeMap {
  Input,
  Select,
  Checkbox,
  Button,
  DatePicker,
  Switch,
  RadioGroup,
  InputNumber,
  TreeSelect,
  FormList,
  Custome, // 自定义的form组件
  Children,
  RangePicker,
  TimePicker
}

// const ComponentMap = {
//   Input,
//   Select,
//   Checkbox,
//   Button,
//   DatePicker,
//   Switch,
//   RadioGroup: Radio.Group,
//   TreeSelect,
//   InputNumber,
//   FormList: Form.List,
//   RangePicker,
//   TimePicker,
// };

type ComponentType = keyof typeof ComponentTypeMap;

type ItemPropsSub = Record<string, any> & {
  children?: React.ReactNode;
} & StyleConfig;

interface FormConfig {
  type: ComponentType;
  FormItemProps: FormItemProps & StyleConfig;
  ItemProps: Array<ItemPropsSub>;
  render?: FormListProps["children"];
  component?: React.ReactNode;
  isFunc?: boolean;
}

type StyleConfig = {
  style?: React.CSSProperties;
};

export type IProps<T> = {
  config: {
    formProps: FormProps<T> & StyleConfig;
    itemProps: Array<FormConfig>;
    ComponentMap: Record<string, React.ReactElement>
  };
};

type ProxyFormProps<T> = IProps<T> & {
  form: FormInstance<T>;
};

type SelectOption =
  | Array<number>
  | Array<string>
  | Array<{ key?: string | number; value: string | number }>;

type InferArray<T> = T extends Array<infer P> ? P : null;

const { Item: FormItem } = Form;

const isValidElement = (component: React.ReactNode, isFunc: boolean): React.ReactNode => {
  if(!component || typeof component !== 'function') return null;
  if(isFunc) {
    return component();
  }else{
    return component;
  }
  return null;
}

const DefaultFormItemFactory = (config: FormConfig, ComponentMap: Record<string, React.ReactNode>) => {
  switch (config.type) {
    case "Input":
    case "Checkbox":
    case "Button":
    case "Switch":
    case "DatePicker":
    case "InputNumber":
    case "TreeSelect":
    case "RangePicker":
    case "TimePicker":
      const Component = ComponentMap[config.type] as React.ElementType;
      const child = config.ItemProps.map((item, index) => {
        const { children, ...restProps } = item;
        return (
          <Component key={item.key || index} {...restProps}>
            {children}
          </Component>
        );
      });

      const _child = child.length === 1 ? child[0] : child;
      return <FormItem {...config.FormItemProps}>{_child}</FormItem>;

    case "Select":
    case "RadioGroup":
      const { option, ...restItemProps } = config.ItemProps[0];
      const { Parent, Child } = {
        Select: {
          Parent: Select,
          Child: Select.Option,
        },
        RadioGroup: {
          Parent: Radio.Group,
          Child: Radio.Button,
        },
      }[config.type];
      return (
        <FormItem {...config.FormItemProps}>
          <Parent {...restItemProps}>
            {((option || []) as Array<any>).map(
              (item: InferArray<SelectOption>) => {
                if (!(item instanceof Object)) {
                  return (
                    <Child key={item} value={item}>
                      {item}
                    </Child>
                  );
                }
                return (
                  <Child key={item.key || item.value} value={item.value}>
                    {item.value}
                  </Child>
                );
              }
            )}
          </Parent>
        </FormItem>
      );
    case "FormList":
      if (!config.render) return null;
      return (
        <Form.List {...(config.FormItemProps as FormListProps)}>
          {(fields, operation, meta) =>
            config.render && config.render(fields, operation, meta)}
        </Form.List>
      );
    case "Custome":
      if(!config.component || React.isValidElement(config.component)) return null
      const customeChild = config.ItemProps.map((item, index) => {
        const { children, ...restProps } = item;
        const TempComponent = config.component as React.ElementType
        return (
          <TempComponent key={item.key || index} {...restProps}>
            {children}
          </TempComponent>
        );
      });

      const _customeChild = customeChild.length === 1 ? customeChild[0] : customeChild;
      return <FormItem {...config.FormItemProps}>{_customeChild}</FormItem>;
    case "Children":
      const ValidElement = isValidElement(config.component, !!config.isFunc)
      if(!ValidElement) return null
      return <FormItem {...config.FormItemProps}>{ValidElement}</FormItem>;
      default:
      return null;
  }
};

const ProxyForm: FC<ProxyFormProps<any>> = function ProxyForm({
  config = { formProps: {}, itemProps: [], ComponentMap: {} },
  form,
}) {
  return (
    <Form form={form} {...config.formProps}>
      {React.Children.map(
        config.itemProps.map((item) => DefaultFormItemFactory(item, config.ComponentMap)),
        (i) => i
      )}
    </Form>
  );
};

export default ProxyForm;
