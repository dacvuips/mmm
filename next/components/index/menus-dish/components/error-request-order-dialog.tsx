import React from 'react'
import { Dialog, DialogProps } from '../../../shared/utilities/dialog/dialog'
import { Button } from '../../../shared/utilities/form'
import { Img } from '../../../shared/utilities/misc'

interface PropsType extends DialogProps { }


export function ErrorRequestOrderDialog({ ...props }: PropsType) {
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
        <div className="flex flex-col justify-center items-center text-center p-5">
          <Img src="/assets/img/icon-chat-failed.png" className="object-cover w-14" />
          <div className="text-danger my-2 font-medium mt-3">Gửi yêu cầu gọi món không thành công!</div>
          <div className="">Bạn đã có một yêu cầu trước đó.</div>
          <div className="">Vui lòng chờ nhân viên tới xác nhận.</div>
          <Button text="Đồng ý" className="w-full rounded-xl h-12 mt-4" danger onClick={props.onClose} />
        </div>
      </Dialog.Body>

    </Dialog>
  )
}