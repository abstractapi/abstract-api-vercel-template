import "server-only";

import type { CheckOutcome, IpData } from "@/lib/types";
import { callAbstract, get } from "./client";

// IP Intelligence: VPN, proxy, Tor and hosting detection plus location.
// `fields` limits the response to the sections the rules read.
export function checkIp(ipAddress: string): Promise<CheckOutcome<IpData>> {
  return callAbstract(
    "https://ip-intelligence.abstractapi.com/v1/",
    { ip_address: ipAddress, fields: "security,location,asn" },
    "ABSTRACT_IP_INTELLIGENCE_API_KEY",
    (json) => ({
      isVpn: get(json, "security.is_vpn"),
      isProxy: get(json, "security.is_proxy"),
      isTor: get(json, "security.is_tor"),
      isHosting: get(json, "security.is_hosting"),
      isRelay: get(json, "security.is_relay"),
      isAbuse: get(json, "security.is_abuse"),
      countryCode: get(json, "location.country_code"),
      countryName: get(json, "location.country"),
      city: get(json, "location.city"),
      asnName: get(json, "asn.name"),
    }),
  );
}
