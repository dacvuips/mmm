import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { RiIndeterminateCircleFill } from "react-icons/ri";

import { ChatProvider } from "../../components/shared/chat/chat-provider";
import { ChatWidget } from "../../components/shared/shop-layout/chat-widget";
import { ErrorCatcher, NotFound, Spinner } from "../../components/shared/utilities/misc";
import { InstructionPage } from "../../components/shop/instructions/instructions-page";
import { useDevice } from "../../lib/hooks/useDevice";
import { useScreen } from "../../lib/hooks/useScreen";
import { useAuth } from "../../lib/providers/auth-provider";
import { useToast } from "../../lib/providers/toast-provider";
import { GraphService } from "../../lib/repo/graph.repo";
import { DefaultHead } from "../default-head";
import { firebase } from "./../../lib/helpers/firebase";
import { Header } from "./components/header";
import { MobileScreen } from "./components/mobile-screen";
import Sidebar, { SIDEBAR_MENUS } from "./components/sidebar";
import { ShopLayoutContext, ShopLayoutProvider } from "./providers/shop-layout-provider";

interface PropsType extends ReactProps {
  fullPage?: boolean;
}
export function ShopLayout({ fullPage, ...props }: PropsType) {
  const { member, redirectToShopLogin, staffPermission } = useAuth();
  const { isSSR, isMobile } = useDevice();
  const toast = useToast();
  const router = useRouter();
  const screen2xl = useScreen("xxl");

  useEffect(() => {
    if (member === null) {
      redirectToShopLogin();
    } else if (member) {
      if (!isSSR) {
        const messaging = firebase.messaging();

        messaging.onMessage((payload) => {
          console.log(payload);
          toast.info(`${payload.notification.title}. ${payload.notification.body || ""}`, null, {
            onClick: async () => {
              await GraphService.clearStore();
              router.push("/shop/orders");
            },
            position: "top-right",
            delay: 5000,
          });
        });
      }
    }
  }, [member]);

  const hasPermission = useMemo(() => {
    if (member === undefined) return undefined;
    const subMenu = SIDEBAR_MENUS[0].subMenus.find(
      (y) => router.pathname === y.path || router.pathname.startsWith(y.path + "/")
    );
    return subMenu?.permission ? staffPermission(subMenu.permission) : true;
  }, [router.pathname, member]);

  return (
    <ShopLayoutProvider>
      <ShopLayoutContext.Consumer>
        {({ shopConfig, subscriptionStatus, hasInstructionCompleted }) => (
          <>
            {!(member && shopConfig) ? (
              <div className="min-h-screen w-h-screen">
                <Spinner />
              </div>
            ) : (
              <>
                <DefaultHead shopCode={member.code} shopLogo={member.shopLogo} />
                {/* <Header /> */}
                <div
                  className={`${
                    fullPage ? "w-full min-h-screen" : "relative flex w-full min-h-screen"
                  }`}
                >
                  {fullPage ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      {isMobile ? (
                        <MobileScreen />
                      ) : hasInstructionCompleted ? (
                        <ChatProvider
                          senderRole="MEMBER"
                          threadId={member.threadId}
                          senderId={member.id}
                        >
                          <Sidebar />
                          <div className="flex flex-col flex-1">
                            <Header />
                            <div
                              className={`${screen2xl ? "p-6 " : "p-3  "} pb-20 ${
                                subscriptionStatus && subscriptionStatus.value !== "ACTIVE"
                                  ? "mt-4"
                                  : ""
                              }`}
                            >
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
                          {staffPermission("READ_ADMIN_CHAT") && (
                            <ChatWidget
                              // memberId={member.id}
                              // threadId={member.threadId || member.thread.id}
                              threadId={member?.threadId || member?.thread?.id}
                              senderId={member?.id}
                              senderRole="MEMBER"
                              receiverRole="ADMIN"
                            />
                          )}
                        </ChatProvider>
                      ) : (
                        <InstructionPage />
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </ShopLayoutContext.Consumer>
    </ShopLayoutProvider>
  );
}
