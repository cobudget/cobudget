import prismaSubscriber from "./prisma.subscriber";
import discourseSubscriber from "./discourse.subscriber";
import loomioSubscriber from "./loomio.subscriber";
import emailSubscriber from "./email.subscriber";

export default {
  initialize: async (eventHub, prisma) => {
    prismaSubscriber.initialize(eventHub, prisma);
    discourseSubscriber.initialize(eventHub);
    loomioSubscriber.initialize(eventHub);
    emailSubscriber.initialize(eventHub);
  },
};
