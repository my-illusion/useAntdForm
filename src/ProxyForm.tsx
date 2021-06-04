import React, { FC } from 'react';
import { 
    Form, 
    Input, 
    Select, 
    Button, 
    Checkbox, 
    Switch,
    Radio,
    DatePicker,
    FormInstance, 
    FormItemProps, 
    FormProps 
} from 'antd';

enum ComponentTypeMap {
    Input,
    Select,
    Checkbox,
    Button,
    DatePicker,
    Switch,
    RadioGroup
}

const ComponentMap = {
    Input,
    Select,
    Checkbox,
    Button,
    DatePicker,
    Switch,
    RadioGroup: Radio.Group
}

type ComponentType = keyof typeof ComponentTypeMap;

type ItemPropsSub = Record<string, any> & { children?: React.ReactNode } & StyleConfig

interface FormConfig {
    type: ComponentType
    FormItemProps: FormItemProps & StyleConfig
    ItemProps: Array<ItemPropsSub>
}

type StyleConfig = {
    style?: React.CSSProperties
}

export type IProps<T> = {
    config: {
        formProps: FormProps<T> & StyleConfig,
        itemProps: Array<FormConfig>
    }
}

type ProxyFormProps<T> = IProps<T> & {
    form: FormInstance<T>
}

type SelectOption = Array<number> | Array<string> | Array<{ key?: string | number, value: string | number }>

type InferArray<T> = T extends Array<infer P> ? P : null

const { Item: FormItem } = Form;

const DefaultFormItemFactory = (config: FormConfig) => {
    switch(config.type) {
        case 'Input':
        case 'Checkbox':
        case 'Button':
        case 'Switch':
        case 'DatePicker':
            const Component = ComponentMap[config.type];
            const child = config.ItemProps.map((item, index) => {
                const { children, ...restProps } = item
                return (
                    <Component key={item.key || index} {...restProps}>{children}</Component>
                )
            })

            const _child = child.length === 1 ? child[0] : child
            return (
                <FormItem {...config.FormItemProps}>
                    {
                        _child
                    }
                </FormItem>
            )
            
        case 'Select':
        case 'RadioGroup':
            const { option, ...restItemProps } = config.ItemProps[0]
            const {Parent, Child} = ({
                Select: {
                    Parent: Select,
                    Child: Select.Option
                },
                RadioGroup: {
                    Parent: Radio.Group,
                    Child: Radio.Button
                }
            })[config.type]
            return (
                <FormItem {...config.FormItemProps}>
                    <Parent {...restItemProps}>
                        {
                            ((option || []) as Array<any>).map((item: InferArray<SelectOption>) => {
                                if(!(item instanceof Object)) {
                                    return (
                                        <Child key={item} value={item}>
                                            {item}
                                        </Child>
                                    )
                                }
                                return (
                                    <Child key={item.key || item.value} value={item.value}>
                                        {item.value}
                                    </Child>
                                )
                            })
                        }
                    </Parent>
                </FormItem>
            )
        // case 'RadioGroup':
        //     const { option, ...restItemProps } = config.ItemProps[0]
        //     return (
        //         <FormItem {...config.FormItemProps}>
        //             <Select {...restItemProps}>
        //                 {
        //                     ((option || []) as Array<any>).map((item: InferArray<SelectOption>) => {
        //                         if(!(item instanceof Object)) {
        //                             return (
        //                                 <Option key={item} value={item}>
        //                                     {item}
        //                                 </Option>
        //                             )
        //                         }
        //                         return (
        //                             <Option key={item.key || item.value} value={item.value}>
        //                                 {item.value}
        //                             </Option>
        //                         )
        //                     })
        //                 }
        //             </Select>
        //         </FormItem>
        //     )
        default:
            return null
    }
}

const ProxyForm: FC<ProxyFormProps<any>> = function ProxyForm({ config = { formProps: {}, itemProps: [] }, form }) {
    return (
        <Form form={form} {...config.formProps}>
            {
                React.Children.map(config.itemProps.map((item) => DefaultFormItemFactory(item)), i => i)
            }
        </Form>
    )
}

export default ProxyForm