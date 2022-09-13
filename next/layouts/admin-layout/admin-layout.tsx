import { NextSeo } from 'next-seo';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { RiIndeterminateCircleFill } from 'react-icons/ri';

import { ChatProvider } from '../../components/shared/chat/chat-provider';
import { ErrorCatcher, NotFound, Spinner } from '../../components/shared/utilities/misc';
import { useScreen } from '../../lib/hooks/useScreen';
import { useAuth } from '../../lib/providers/auth-provider';
import { DefaultHead } from '../default-head';
import { Header } from './components/header';
import { SIDEBAR_MENUS } from './components/sidebar';
import { AdminLayoutProvider } from './providers/admin-layout-provider';

const Sidebar = dynamic<any>(() => import("./components/sidebar"));

interface PropsType extends ReactProps {
  scope?: string;
}
export function AdminLayout({ ...props }: PropsType) {
  const { user, redirectToAdminLogin, adminPermission } = useAuth();
  const router = useRouter();
  const screen2xl = useScreen("xxl");

  useEffect(() => {
    if (user === null) {
      redirectToAdminLogin();
    }
  }, [user]);

  const hasPermission = useMemo(() => {
    if (user === undefined) return undefined;
    const subMenu = SIDEBAR_MENUS[0].submenus.find(
      (y) => router.pathname === y.path || router.pathname.startsWith(y.path + "/")
    );
    return subMenu?.permission ? adminPermission(subMenu.permission) : true;
  }, [router.pathname, user]);

  return (
    <>
      <DefaultHead shopCode="" shopLogo="" />
      {!user ? (
        <div className="min-h-screen w-h-screen">
          <Spinner />
        </div>
      ) : (
        <AdminLayoutProvider>
          <NextSeo title="3MShop Admin" />
          <ChatProvider senderRole="ADMIN" senderId={user.id}>
            <Header />
            <div className="relative flex w-full min-h-screen pt-14">
              <Sidebar />
              <div className={`${screen2xl ? "pl-60" : "pl-24"} flex flex-col flex-1 `}>
                <div className={`${screen2xl ? "p-6 " : " p-3"}`}>
                  {/* {!props.scope || (props.scope && user.scopes.includes(props.scope)) ? (
                    <ErrorCatcher>{props.children}</ErrorCatcher>
                  ) : (
                    <Card>
                      <NotFound icon={<HiOutlineExclamation />} text="Không đủ quyền truy cập" />
                    </Card>
                  )} */}

                  <ErrorCatcher>
                    {hasPermission ? (
                      <>{props.children}</>
                    ) : hasPermission === false ? (
                      <NotFound
                        icon={<RiIndeterminateCircleFill />}
                        text="Không có quyền truy cập tính năng này"
                      />
                    ) : (
                      <></>
                    )}
                  </ErrorCatcher>
                </div>
              </div>
            </div>
          </ChatProvider>
        </AdminLayoutProvider>
      )}
    </>
  );
}
