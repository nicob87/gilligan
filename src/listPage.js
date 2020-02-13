/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import React from "react";
import { PageSection, PageSectionVariants } from "@patternfly/react-core";

import {
  Card,
  CardBody,
  CardHead,
  Gallery,
  GalleryItem,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants
} from "@patternfly/react-core";
import CardHealth from "./cardHealth";
import { safePlural } from "./qdrGlobals";
import ListToolbar from "./listToolbar";
import { Icap, strDate } from "./qdrGlobals";

// make sure you've installed @patternfly/patternfly
class ListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cardSize: "compact",
      cardShow: "all",
      lastUpdated: new Date()
    };
    this.cardAttributes = {
      cluster: {
        compact: ["provider"],
        expanded: ["location", "zone"]
      },
      service: {
        compact: ["protocol", { title: "site(s)", getFn: this.getSites }],
        expanded: [{ title: this.getRequestTitle, getFn: this.getRequests }]
      }
    };
  }

  subNodes = cluster => cluster.services.length;

  getSites = service =>
    Array.from(
      new Set(
        service.targets.map(
          site =>
            this.props.service.VAN.sites.find(
              VANSite => VANSite.site_id === site.site_id
            ).site_name
        )
      )
    ).join(", ");

  getRequestTitle = service => {
    return service.requests_sent ? "Requests sent" : "Requests handled";
  };

  getRequests = service => {
    if (service.requests_sent) {
      return this.getRequestsSent(service);
    }
    return this.getRequestsHandled(service);
  };
  getRequestsHandled = service => {
    const handled = [];
    service.requests_handled.forEach(request => {
      handled.push(
        <div className="card-request">
          <span className="card-request-site">
            {this.props.service.adapter.siteNameFromId(request.site_id)}
          </span>
          <span className="card-request-requests">{request.requests}</span>
        </div>
      );
    });
    return handled;
  };
  getRequestsSent = service => {
    const handled = [];
    service.requests_sent.forEach(request => {
      handled.push(
        <div className="card-request">
          <span className="card-request-site">
            {this.props.service.adapter.siteNameFromId(request.site_id)}
          </span>
          <span className="card-request-requests">{request.requests}</span>
        </div>
      );
    });
    return handled;
  };
  handleChangeSize = event => {
    this.setState({ cardSize: event.target.id });
  };
  handleChangeShow = event => {
    this.setState({ cardShow: event.target.id });
  };

  bodyLine = (expanded, prop, obj) => {
    const property = prop.getFn ? prop.getFn(obj) : obj[prop];
    const title = prop.title
      ? typeof prop.title === "function"
        ? prop.title(obj)
        : prop.title
      : prop;
    return (
      <div className="body-line">
        {expanded ? (
          <span className="body-line-prompt">{Icap(title)}</span>
        ) : (
          ""
        )}
        <span className="body-line-value">{property}</span>
      </div>
    );
  };

  siteBodies = cluster => {
    const expanded = this.state.cardSize === "expanded";
    let bodies = this.cardAttributes.cluster.compact.map(attr => (
      <CardBody key={attr}>{this.bodyLine(expanded, attr, cluster)}</CardBody>
    ));
    if (expanded) {
      bodies = [
        ...bodies,
        ...this.cardAttributes.cluster.expanded.map(attr => (
          <CardBody key={attr}>
            {this.bodyLine(expanded, attr, cluster)}
          </CardBody>
        ))
      ];
    }

    return bodies;
  };

  serviceBodies = service => {
    const expanded = this.state.cardSize === "expanded";
    let bodies = this.cardAttributes.service.compact.map(attr => {
      return (
        <CardBody key={typeof attr === "string" ? attr : attr.title}>
          {this.bodyLine(expanded, attr, service)}
        </CardBody>
      );
    });
    if (expanded) {
      bodies = [
        ...bodies,
        ...this.cardAttributes.service.expanded.map(attr => (
          <CardBody key={attr}>
            {this.bodyLine(expanded, attr, service)}
          </CardBody>
        ))
      ];
    }

    return bodies;
  };
  render() {
    const { sites, services } = this.props.service.VAN;
    const { cardSize, cardShow } = this.state;
    return (
      <React.Fragment>
        <PageSection variant={PageSectionVariants.light} className="list-page">
          <Stack>
            <StackItem className="overview-header">
              <TextContent>
                <Text className="overview-title" component={TextVariants.h1}>
                  Card view
                </Text>
                <Text className="overview-loading" component={TextVariants.pre}>
                  {`Updated ${strDate(this.state.lastUpdated)}`}
                </Text>
              </TextContent>
            </StackItem>
            <StackItem>
              <ListToolbar
                size={cardSize}
                show={cardShow}
                handleChangeSize={this.handleChangeSize}
                handleChangeShow={this.handleChangeShow}
              />
            </StackItem>
          </Stack>
        </PageSection>
        <PageSection className="list-section">
          <Gallery gutter="md">
            <React.Fragment>
              {(cardShow === "all" || cardShow === "sites") &&
                sites.map((c, i) => (
                  <GalleryItem key={c.site_id}>
                    <Card isHoverable isCompact className="list-card">
                      <CardHead>
                        <div className="card-cluster-header">
                          <i className="pf-icon pf-icon-cluster"></i>
                          <span>{c.site_name}</span>
                        </div>
                      </CardHead>
                      <CardBody>
                        Health <CardHealth cluster={c} />
                      </CardBody>
                      <CardBody>
                        {this.subNodes(c)}{" "}
                        {safePlural(this.subNodes(c), "service")}
                      </CardBody>
                      {this.siteBodies(c)}
                    </Card>
                  </GalleryItem>
                ))}
              {(cardShow === "all" || cardShow === "services") &&
                services.map((s, i) => (
                  <GalleryItem key={s.address}>
                    <Card isHoverable isCompact className="list-card">
                      <CardHead>
                        <div className="card-cluster-header">
                          <i className="pf-icon pficon-container-node"></i>
                          <span>{s.address}</span>
                        </div>
                      </CardHead>
                      <CardBody>
                        Health <CardHealth cluster={s} />
                      </CardBody>
                      {this.serviceBodies(s)}
                    </Card>
                  </GalleryItem>
                ))}
            </React.Fragment>
          </Gallery>
        </PageSection>
      </React.Fragment>
    );
  }
}

export default ListPage;
