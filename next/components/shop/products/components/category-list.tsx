import { useRef, useState } from "react";
import { RiMoreFill, RiArrowUpLine, RiArrowDownLine } from "react-icons/ri";
import { useAlert } from "../../../../lib/providers/alert-provider";
import { useAuth } from "../../../../lib/providers/auth-provider";
import { Category } from "../../../../lib/repo/category.repo";
import { Product } from "../../../../lib/repo/product.repo";
import { QRDialog } from "../../../shared/shop-layout/qr-dialog";
import { Button } from "../../../shared/utilities/form/button";
import { Switch } from "../../../shared/utilities/form/switch";
import { Dropdown } from "../../../shared/utilities/popover/dropdown";
import { Spinner, NotFound } from "../../../shared/utilities/misc";
import { useProductsContext } from "../providers/products-provider";
import { ProductForm } from "./product-form";
import { ProductItem } from "./product-item";
import { useToast } from "../../../../lib/providers/toast-provider";


interface PropsType extends ReactProps {
  onEditClick: (category: Category) => any;
  reload: Function;
}
export function CategoryList({ onEditClick, ...props }: PropsType) {
  const { member } = useAuth();
  const {
    categories,
    removeCategory,
    onDeleteProduct,
    onToggleProduct,
    onToggleCategory,
    filter,
    changePositionProduct,
  } = useProductsContext();
  const [openProduct, setOpenProduct] = useState<Product>(undefined);
  const [openCategory, setOpenCategory] = useState<Category>(null);
  const [showQRCode, setShowQRCode] = useState<Product>(null);
  const [catChange, setCatChange] = useState<Category>(null);
  const ref = useRef();
  const alert = useAlert();
  const { staffPermission } = useAuth();
  const toast = useToast();
  const hasWritePermission = staffPermission("WRITE_PRODUCTS");


  if (!categories) return <Spinner />;
  if (!categories.length) return <NotFound text="Chưa có danh mục nào" />;
  return (
    <>
      {categories.map((category, index) => (
        <div className="mt-4 mb-8" key={category.id}>
          <div className="flex pl-0.5 pb-3 items-center">
            <h5 className="text-xl font-bold text-gray-700">{category.name}</h5>
            <span className="pt-1 pl-2 text-sm text-gray-400">(Ưu tiên: {category.priority})</span>
            <Button className="h-8" icon={<RiMoreFill />} iconClassName="text-xl" innerRef={ref} />
            <Dropdown reference={ref} placement="bottom-start">
              <Dropdown.Item text="Chỉnh sửa danh mục" onClick={() => onEditClick(category)} />
              <Dropdown.Item
                hoverDanger
                text="Xoá danh mục"
                onClick={() => {
                  if (hasWritePermission) {
                    removeCategory(category)
                  } else {
                    toast.info("Bạn không có quyền xóa danh mục")
                  }
                }}
              />
            </Dropdown>
            <Switch
              value={!category.hidden}
              onChange={async () => {
                onToggleCategory(category);
              }}
              readOnly={!hasWritePermission}
            />
          </div>
          {category.products
            .filter((x) => {
              if (filter.allowSale === true || filter.allowSale === false)
                return x.allowSale == filter.allowSale;
              else return true;
            })
            .map((product, proIndex) => (
              <div className="relative bg-white group" key={proIndex}>
                <div className="absolute flex gap-2 mb-1 font-semibold uppercase opacity-0 -top-3 right-4 text-primary group-hover:opacity-100">
                  <Button
                    outline
                    className="w-8 h-8 px-0 bg-white rounded-full"
                    icon={<RiArrowUpLine />}
                    tooltip="Di chuyển lên"
                    disabled={proIndex == 0 || !hasWritePermission}
                    onClick={() => changePositionProduct(index, proIndex, false)}
                  />
                  <Button
                    outline
                    className="w-8 h-8 px-0 bg-white rounded-full"
                    icon={<RiArrowDownLine />}
                    tooltip="Di chuyển xuống"
                    disabled={proIndex == category.products.length - 1 || !hasWritePermission}
                    onClick={() => changePositionProduct(index, proIndex, true)}
                  />
                </div>
                <ProductItem
                  product={product}
                  onClick={() => {
                    setOpenProduct(product);
                    setOpenCategory(category);
                  }}
                  onToggleClick={async () => {
                    onToggleProduct(product, category);
                  }}
                  onDeleteClick={async () => {
                    if (!(await alert.danger(`Xoá món "${product.name}"`, "", "Xoá món"))) return;
                    await onDeleteProduct(product, category);
                  }}
                  onShowQRCode={() => {
                    setShowQRCode(product);
                  }}
                />
              </div>
            ))}
          <Button
            className="h-12 bg-white"
            outline
            primary
            text="Thêm món mới"
            onClick={() => {
              setOpenProduct(null);
              setOpenCategory(category);
            }}
          />
        </div>
      ))}
      <QRDialog
        isOpen={showQRCode ? true : false}
        onClose={() => setShowQRCode(null)}
        name={showQRCode?.code}
        link={`${location.origin}/${member.code}/?product=${showQRCode?.code}`}
      />
      <ProductForm
        id={openProduct ? openProduct.id : openProduct === null ? null : undefined}
        category={openCategory}
        isOpen={openProduct !== undefined}
        onClose={() => {
          setOpenProduct(undefined);
          props.reload();
        }}
      />
    </>
  );
}
