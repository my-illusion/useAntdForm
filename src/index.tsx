import React, { useMemo } from 'react';
import { Form } from 'antd';

import type { IProps } from './ProxyForm'
import ProxyForm from './ProxyForm'

const useAntdForm = function useAntdForm<T = {}>({ config }: IProps<T>){

    const [form] = Form.useForm()

    const FormComponent = useMemo(() => {
       return (
           <ProxyForm config={config} form={form}/>
       )
    }, [config, form])

    return {
        Form: FormComponent,
        ...form
    }
}

export default useAntdForm