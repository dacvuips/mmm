import React from 'react'
import { Dialog, DialogProps } from '../../../shared/utilities/dialog/dialog'
import { Button } from '../../../shared/utilities/form'

interface PropsType extends DialogProps { }

export function ConfirmOrderDialog({ ...props }: PropsType) {
  return (
    <Dialog
      extraDialogClass="rounded-3xl"
      bodyClass=" bg-white rounded-xl "
      extraFooterClass=" z-40"
      headerClass=""
      slideFromBottom="none"
      {...props}
    >
      <Dialog.Body>
        <div className="p-5 text-center rounded-lg">
          <p className="px-5 my-3 font-semibold text-md">Bạn có chắc muốn đặt các món đã chọn hay không?</p>
          <div className='grid grid-cols-2 gap-3'>
            <Button
              text="Bỏ qua"
              className="border border-blue-100 rounded-lg h-14"
              onClick={props.onClose}

            />
            <Button
              text="Đồng ý "
              primary
              className="rounded-lg h-14"
              // href={{ pathname: `${location.pathname}/payment`, }}
              onClick={props.onClose}
            />
          </div>
        </div>
      </Dialog.Body>

    </Dialog>
  )
}