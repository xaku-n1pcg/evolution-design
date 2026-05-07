"use client";

import { useState, useCallback } from "react";
import { useSuspenseQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  POSC_PRODUCTS,
  POSC_PRODUCT_CATEGORIES,
  POSC_PRODUCTS_COUNT,
} from "@/graphql/ecommerce/queries/product";
import {
  PoscProductsData,
  PoscProductsVariables,
  PoscProductCategoriesData,
  PoscProductCategoriesVariables,
  PoscProductsCountData,
  PoscProductsCountVariables,
} from "@/graphql/ecommerce/queries/product";
import ProductCard from "@/components/products/ProductCard";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Loader";
import EmptyState from "@/components/common/EmptyState";

export default function ProductsPage() {
  const t = useTranslations("Products");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data: categoriesData } = useSuspenseQuery<PoscProductCategoriesData>(
    POSC_PRODUCT_CATEGORIES,
    { variables: { perPage: 50 } as PoscProductCategoriesVariables }
  );

  const { data: productsData, loading: productsLoading } = useSuspenseQuery<PoscProductsData>(
    POSC_PRODUCTS,
    {
      variables: {
        perPage,
        page,
        categoryId,
        searchValue: searchValue || undefined,
        isKiosk: true,
      } as PoscProductsVariables,
    }
  );

  const { data: countData } = useSuspenseQuery<PoscProductsCountData>(
    POSC_PRODUCTS_COUNT,
    {
      variables: {
        categoryId,
        searchValue: searchValue || undefined,
        isKiosk: true,
      } as PoscProductsCountVariables,
    }
  );

  const handleCursorChange = useCallback((cursor: string | null) => {
    setPage((prev) => (cursor ? prev + 1 : 1));
  }, []);

  const categories = categoriesData?.poscProductCategories || [];
  const products = productsData?.poscProducts || [];
  const totalCount = countData?.poscProductsTotalCount || 0;

  return (
    <div className="pt-24 pb-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col md:flex-row gap-4 mb-12"
        >
          <div className="flex-1">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="w-full h-10 px-4 bg-input border border-border text-sm rounded-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => {
                setCategoryId(undefined);
                setPage(1);
              }}
              className={`h-10 px-4 text-sm rounded-sm whitespace-nowrap transition-colors ${
                !categoryId
                  ? "bg-foreground text-primary-foreground"
                  : "bg-input border border-border hover:bg-secondary"
              }`}
            >
              {t("all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => {
                  setCategoryId(cat._id);
                  setPage(1);
                }}
                className={`h-10 px-4 text-sm rounded-sm whitespace-nowrap transition-colors ${
                  categoryId === cat._id
                    ? "bg-foreground text-primary-foreground"
                    : "bg-input border border-border hover:bg-secondary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        {productsLoading ? (
          <PageLoader />
        ) : products.length === 0 ? (
          <EmptyState title={t("noProducts")} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>

            <div className="mt-12">
              <Pagination
                pageInfo={{ totalCount }}
                limit={perPage}
                onCursorChange={handleCursorChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
