import { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { useToast } from "../providers/toast-provider";
import { BaseModel, CrudRepository, Pagination, QueryInput } from "../repo/crud.repo";
import { useMemoCompare } from "./useMemoCompare";

export interface CrudProps<T extends BaseModel> extends ReactProps {
  items?: T[];
  setItems?: (items: T[]) => any;
  pagination?: Pagination;
  setPagination?: (pagination: Pagination) => any;
  page?: number;
  setPage?: (page: number) => any;
  total?: number;
  query?: QueryInput;
  loading?: boolean;
  loadingAll?: boolean;
  loadingMore?: boolean;
  loadAll?: (refresh: boolean) => Promise<T[]>;
  loadMore?: () => Promise<T[]>;
  create?: (data: Partial<T>) => Promise<Partial<T>>;
  update?: (id: string, data: Partial<T>) => Promise<Partial<T>>;
  deleteOne?: (id: string) => Promise<any>;
  updateItem?: ({ id, data }: { id: string; data: Partial<T> }) => any;
  hasMore?: boolean;
}

export function useCrud<T>(
  service: CrudRepository<T>,
  query: QueryInput = {},
  {
    fragment,
    fetchingCondition,
    cache,
    token,
  }: {
    fragment?: string;
    fetchingCondition?: boolean;
    cache?: boolean;
    token?: string;
  } = {}
) {
  const [items, setItems] = useState<T[]>();
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: query.page || 1,
    limit: query.limit || 10,
  });
  const toast = useToast();
  const newQuery = useMemoCompare(query);

  const loadAll = (refresh: boolean = false) => {
    setLoading(true);
    setLoadingAll(true);
    return service
      .getAll({
        query: { ...newQuery, limit: pagination.limit, page: pagination.page },
        fragment,
        toast,
        cache: cache !== undefined ? cache : !refresh,
        token,
      })
      .then((res) => {
        setItems(cloneDeep(res.data));
        setPagination(res.pagination);
        return res.data;
      })
      .finally(() => {
        setLoading(false);
        setLoadingAll(false);
      });
  };

  const loadMore = () => {
    setLoading(true);
    setLoadingMore(true);
    return service
      .getAll({
        query: {
          ...newQuery,
          limit: pagination.limit,
          page: pagination.page,
          offset: items.length,
        },
        fragment,
        toast,
        token,
      })
      .then((res) => {
        setItems([...items, ...cloneDeep(res.data)]);
        setPagination(res.pagination);
        return res.data;
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  const create = async (data: T) =>
    await service.create({ data, toast, token }).then((res) => {
      loadAll();
      return res;
    });

  const deleteOne = async (id: string) =>
    await service.delete({ id, toast, token }).then((res) => {
      loadAll();
      return res;
    });
  const update = async (id: string, data: T) =>
    await service.update({ id, data, toast, token }).then((res) => {
      loadAll();
      return res;
    });

  const setPage = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const updateItem = ({ id, data }: { id: string; data: Partial<T> }) => {
    const item = items.find((x) => (x as any).id == id);
    if (item) {
      for (let key of Object.keys(data)) {
        item[key] = data[key];
      }
    }
    setItems([...items]);
  };

  useEffect(() => {
    if (fetchingCondition !== false) {
      loadAll();
    } else {
      setItems(null);
      setLoading(false);
    }
  }, [newQuery, pagination.page, fetchingCondition]);

  const hasMore = items && items.length < pagination.total;

  return {
    items,
    setItems,
    pagination,
    setPagination,
    page: pagination.page,
    total: pagination.total,
    setPage,
    query: newQuery,
    loading,
    loadingAll,
    loadingMore,
    loadAll,
    loadMore,
    deleteOne,
    create,
    update,
    updateItem,
    hasMore,
  };
}
